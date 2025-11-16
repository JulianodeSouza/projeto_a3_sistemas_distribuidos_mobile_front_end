import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import type { Debt } from '../components/Dashboard';

interface PaymentPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
}

interface RenegotiationOption {
  debtId: string;
  type: 'discount' | 'interest' | 'extension';
  discountPercent?: number;
  newInterestRate?: number;
  additionalMonths?: number;
}

interface RenegotiationResult {
  debt: Debt;
  original: {
    remaining: number;
    monthlyPayment: number;
    totalInterest: number;
    monthsRemaining: number;
  };
  negotiated: {
    newAmount: number;
    monthlyPayment: number;
    totalInterest: number;
    totalMonths: number;
    savings: number;
  };
}

export function PaymentPlanDialog({ isOpen, onClose, debts }: PaymentPlanDialogProps) {
  const [selectedDebtIds, setSelectedDebtIds] = useState<Set<string>>(new Set());
  const [renegotiationOptions, setRenegotiationOptions] = useState<Map<string, RenegotiationOption>>(new Map());
  const [results, setResults] = useState<RenegotiationResult[] | null>(null);

  const calculateRemaining = (debt: Debt) => {
    return debt.amount - ((debt.amount / debt.installments) * debt.paidInstallments);
  };

  const calculateMonthlyPayment = (debt: Debt) => {
    return debt.amount / debt.installments;
  };

  const calculateTotalInterest = (principal: number, monthlyRate: number, months: number) => {
    const monthlyPayment = principal / months;
    const totalPaid = monthlyPayment * months;
    const interestPaid = totalPaid - principal;
    return Math.max(0, interestPaid);
  };

  const handleToggleDebt = (debtId: string) => {
    const newSelected = new Set(selectedDebtIds);
    if (newSelected.has(debtId)) {
      newSelected.delete(debtId);
      const newOptions = new Map(renegotiationOptions);
      newOptions.delete(debtId);
      setRenegotiationOptions(newOptions);
    } else {
      newSelected.add(debtId);
    }
    setSelectedDebtIds(newSelected);
  };

  const handleRenegotiationChange = (debtId: string, option: Partial<RenegotiationOption>) => {
    const newOptions = new Map(renegotiationOptions);
    const currentOption = newOptions.get(debtId) || { debtId, type: 'discount' };
    newOptions.set(debtId, { ...currentOption, ...option });
    setRenegotiationOptions(newOptions);
  };

  const handleCalculate = () => {
    const calculatedResults: RenegotiationResult[] = [];

    selectedDebtIds.forEach(debtId => {
      const debt = debts.find(d => d.id === debtId);
      if (!debt) return;

      const remaining = calculateRemaining(debt);
      const monthlyPayment = calculateMonthlyPayment(debt);
      const monthsRemaining = debt.installments - debt.paidInstallments;
      const originalInterest = calculateTotalInterest(remaining, debt.interestRate / 100, monthsRemaining);

      const option = renegotiationOptions.get(debtId);
      let newAmount = remaining;
      let newRate = debt.interestRate;
      let newMonths = monthsRemaining;

      if (option) {
        if (option.type === 'discount' && option.discountPercent) {
          newAmount = remaining * (1 - option.discountPercent / 100);
        } else if (option.type === 'interest' && option.newInterestRate !== undefined) {
          newRate = option.newInterestRate;
        } else if (option.type === 'extension' && option.additionalMonths) {
          newMonths = monthsRemaining + option.additionalMonths;
        }
      }

      const newMonthlyPayment = newAmount / newMonths;
      const newInterest = calculateTotalInterest(newAmount, newRate / 100, newMonths);
      const savings = (remaining + originalInterest) - (newAmount + newInterest);

      calculatedResults.push({
        debt,
        original: {
          remaining,
          monthlyPayment,
          totalInterest: originalInterest,
          monthsRemaining
        },
        negotiated: {
          newAmount,
          monthlyPayment: newMonthlyPayment,
          totalInterest: newInterest,
          totalMonths: newMonths,
          savings
        }
      });
    });

    setResults(calculatedResults);
  };

  const handleReset = () => {
    setSelectedDebtIds(new Set());
    setRenegotiationOptions(new Map());
    setResults(null);
  };

  const getTotalSavings = () => {
    if (!results) return 0;
    return results.reduce((sum, result) => sum + result.negotiated.savings, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Renegociação de Dívidas</DialogTitle>
          <DialogDescription>
            Selecione suas dívidas e explore opções de renegociação para reduzir sua carga financeira
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Passo 1: Seleção de Dívidas */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="text-slate-900">Selecione as Dívidas</h3>
                <p className="text-slate-600">Escolha quais dívidas você deseja renegociar</p>
              </div>
            </div>

            {debts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-400 mb-3">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
                <p className="text-slate-600">Nenhuma dívida cadastrada ainda.</p>
                <p className="text-slate-500 mt-1">Adicione suas dívidas para começar a renegociar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {debts.map(debt => {
                  const remaining = calculateRemaining(debt);
                  const isSelected = selectedDebtIds.has(debt.id);

                  return (
                    <div
                      key={debt.id}
                      className={`bg-white p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected ? 'border-purple-500 shadow-md' : 'border-slate-200 hover:border-purple-300'
                      }`}
                      onClick={() => handleToggleDebt(debt.id)}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleDebt(debt.id)}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-slate-900">{debt.name}</h4>
                              <p className="text-slate-600">{debt.creditor}</p>
                            </div>
                            <Badge className="bg-orange-600">
                              {debt.interestRate}% a.m.
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200">
                            <div>
                              <p className="text-slate-600">Valor Restante</p>
                              <p className="text-slate-900">
                                R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600">Parcelas Restantes</p>
                              <p className="text-slate-900">
                                {debt.installments - debt.paidInstallments} de {debt.installments}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600">Vencimento</p>
                              <p className="text-slate-900">
                                {new Date(debt.dueDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Passo 2: Opções de Renegociação */}
          {selectedDebtIds.size > 0 && (
            <Card className="p-6 bg-white border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-slate-900">Configure as Opções de Renegociação</h3>
                  <p className="text-slate-600">Escolha a melhor estratégia para cada dívida selecionada</p>
                </div>
              </div>

              <div className="space-y-6">
                {Array.from(selectedDebtIds).map(debtId => {
                  const debt = debts.find(d => d.id === debtId);
                  if (!debt) return null;

                  const option = renegotiationOptions.get(debtId) || { debtId, type: 'discount' };

                  return (
                    <div key={debtId} className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-slate-900 mb-4">{debt.name}</h4>

                      <Tabs
                        value={option.type}
                        onValueChange={(value) => handleRenegotiationChange(debtId, { type: value as 'discount' | 'interest' | 'extension' })}
                      >
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="discount">Desconto</TabsTrigger>
                          <TabsTrigger value="interest">Redução de Juros</TabsTrigger>
                          <TabsTrigger value="extension">Prazo Estendido</TabsTrigger>
                        </TabsList>

                        <TabsContent value="discount" className="mt-4">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start gap-3 mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                              </svg>
                              <div>
                                <h5 className="text-slate-900 mb-1">Desconto no Montante</h5>
                                <p className="text-slate-700">
                                  Negocie um desconto direto no valor total da dívida. Comum em renegociações à vista ou com entrada significativa.
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label>Percentual de Desconto</Label>
                                  <span className="text-green-700">{option.discountPercent || 0}%</span>
                                </div>
                                <Slider
                                  value={[option.discountPercent || 0]}
                                  onValueChange={(value) => handleRenegotiationChange(debtId, { discountPercent: value[0] })}
                                  max={50}
                                  step={5}
                                  className="w-full"
                                />
                                <div className="flex justify-between mt-1 text-slate-600">
                                  <span>0%</span>
                                  <span>50%</span>
                                </div>
                              </div>
                              <div className="p-3 bg-white rounded border border-green-300">
                                <p className="text-slate-600">Novo valor da dívida</p>
                                <p className="text-green-700 mt-1">
                                  R$ {(calculateRemaining(debt) * (1 - (option.discountPercent || 0) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  <span className="ml-2 text-slate-600">
                                    (economia de R$ {(calculateRemaining(debt) * ((option.discountPercent || 0) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="interest" className="mt-4">
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-3 mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 shrink-0">
                                <line x1="12" x2="12" y1="2" y2="22"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                              </svg>
                              <div>
                                <h5 className="text-slate-900 mb-1">Redução da Taxa de Juros</h5>
                                <p className="text-slate-700">
                                  Negocie uma taxa de juros menor para diminuir o custo total ao longo do tempo. Ideal para dívidas de longo prazo.
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label>Nova Taxa de Juros (% a.m.)</Label>
                                  <span className="text-blue-700">{option.newInterestRate !== undefined ? option.newInterestRate : debt.interestRate}%</span>
                                </div>
                                <Slider
                                  value={[option.newInterestRate !== undefined ? option.newInterestRate : debt.interestRate]}
                                  onValueChange={(value) => handleRenegotiationChange(debtId, { newInterestRate: value[0] })}
                                  max={debt.interestRate}
                                  min={0}
                                  step={0.1}
                                  className="w-full"
                                />
                                <div className="flex justify-between mt-1 text-slate-600">
                                  <span>0%</span>
                                  <span>{debt.interestRate}% (atual)</span>
                                </div>
                              </div>
                              <div className="p-3 bg-white rounded border border-blue-300">
                                <p className="text-slate-600">Redução na taxa</p>
                                <p className="text-blue-700 mt-1">
                                  {(debt.interestRate - (option.newInterestRate !== undefined ? option.newInterestRate : debt.interestRate)).toFixed(2)} pontos percentuais
                                </p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="extension" className="mt-4">
                          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-start gap-3 mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 shrink-0">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                <line x1="16" x2="16" y1="2" y2="6"/>
                                <line x1="8" x2="8" y1="2" y2="6"/>
                                <line x1="3" x2="21" y1="10" y2="10"/>
                              </svg>
                              <div>
                                <h5 className="text-slate-900 mb-1">Extensão de Prazo</h5>
                                <p className="text-slate-700">
                                  Amplie o prazo de pagamento para reduzir as parcelas mensais. Ajuda no fluxo de caixa, mas pode aumentar o custo total.
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label>Meses Adicionais</Label>
                                  <span className="text-amber-700">+{option.additionalMonths || 0} meses</span>
                                </div>
                                <Slider
                                  value={[option.additionalMonths || 0]}
                                  onValueChange={(value) => handleRenegotiationChange(debtId, { additionalMonths: value[0] })}
                                  max={36}
                                  step={6}
                                  className="w-full"
                                />
                                <div className="flex justify-between mt-1 text-slate-600">
                                  <span>0 meses</span>
                                  <span>36 meses</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white rounded border border-amber-300">
                                  <p className="text-slate-600">Prazo original</p>
                                  <p className="text-slate-900 mt-1">
                                    {debt.installments - debt.paidInstallments} meses
                                  </p>
                                </div>
                                <div className="p-3 bg-white rounded border border-amber-300">
                                  <p className="text-slate-600">Novo prazo</p>
                                  <p className="text-amber-700 mt-1">
                                    {(debt.installments - debt.paidInstallments) + (option.additionalMonths || 0)} meses
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Passo 3: Ação */}
          {selectedDebtIds.size > 0 && (
            <div className="flex gap-3">
              <Button 
                onClick={handleCalculate} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                </svg>
                Calcular Impacto da Renegociação
              </Button>
              {results && (
                <Button onClick={handleReset} variant="outline">
                  Limpar
                </Button>
              )}
            </div>
          )}

          {/* Resultado */}
          {results && results.length > 0 && (
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <h3 className="text-slate-900 mb-4">✨ Resultados da Renegociação</h3>
              
              {/* Resumo Geral */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-slate-600">Dívidas Renegociadas</p>
                  <p className="text-slate-900 mt-1">
                    {results.length} {results.length === 1 ? 'dívida' : 'dívidas'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-slate-600">Economia Total</p>
                  <p className="text-green-600 mt-1">
                    R$ {getTotalSavings().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-slate-600">Status</p>
                  <p className="text-green-600 mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Vantajoso
                  </p>
                </div>
              </div>

              {/* Detalhes de cada dívida */}
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={result.debt.id} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-slate-900">{result.debt.name}</h4>
                        <p className="text-slate-600">{result.debt.creditor}</p>
                      </div>
                      <Badge className="bg-green-600">
                        Economia: R$ {result.negotiated.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Antes */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <h5 className="text-slate-700">Antes da Renegociação</h5>
                        </div>
                        <div className="space-y-2 pl-4">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Valor Restante:</span>
                            <span className="text-slate-900">
                              R$ {result.original.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Parcela Mensal:</span>
                            <span className="text-slate-900">
                              R$ {result.original.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Juros Estimados:</span>
                            <span className="text-red-600">
                              R$ {result.original.totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Meses Restantes:</span>
                            <span className="text-slate-900">{result.original.monthsRemaining}</span>
                          </div>
                        </div>
                      </div>

                      {/* Depois */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <h5 className="text-slate-700">Após a Renegociação</h5>
                        </div>
                        <div className="space-y-2 pl-4">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Novo Valor:</span>
                            <span className="text-green-700">
                              R$ {result.negotiated.newAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Nova Parcela:</span>
                            <span className="text-green-700">
                              R$ {result.negotiated.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Juros Estimados:</span>
                            <span className="text-green-600">
                              R$ {result.negotiated.totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Novo Prazo:</span>
                            <span className="text-green-700">{result.negotiated.totalMonths} meses</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                  <div>
                    <h4 className="text-slate-900 mb-1">💡 Próximos Passos</h4>
                    <p className="text-slate-700 mb-2">
                      Entre em contato com seus credores e apresente estas propostas de renegociação. Lembre-se:
                    </p>
                    <ul className="text-slate-700 space-y-1 ml-4">
                      <li>• Seja honesto sobre sua situação financeira</li>
                      <li>• Peça sempre o acordo por escrito</li>
                      <li>• Compare diferentes ofertas antes de aceitar</li>
                      <li>• Negocie diretamente com o credor sempre que possível</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
