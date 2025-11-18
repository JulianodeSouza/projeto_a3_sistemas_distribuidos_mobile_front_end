import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import api from '../utils/api'; // Importar API
import { toast } from 'sonner'; // Importar Toast

interface SimulationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// DTO que vem do Java
interface SimulationResultDTO {
  institutionName: string;
  monthlyInterestRate: number;
  installmentValue: number;
  totalAmount: number;
  cetPercentage: number;
}

export function SimulationDialog({ isOpen, onClose }: SimulationDialogProps) {
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('');
  const [results, setResults] = useState<SimulationResultDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const principal = parseFloat(amount);
    const months = parseInt(installments);

    if (!principal || !months) return;

    try {
      setIsLoading(true);
      // CHAMA A API DO JAVA
      const data = await api.get<SimulationResultDTO[]>(
        `simulations?value=${principal}&installments=${months}`
      );
      
      // A API do Java já devolve ordenado (do melhor para o pior)
      setResults(data);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao realizar simulação.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAmount('');
    setInstallments('');
    setResults(null);
  };

  const getBestAndWorst = () => {
    if (!results || results.length < 2) return null;
    const best = results[0];
    const worst = results[results.length - 1];
    const difference = worst.totalAmount - best.totalAmount;
    // Cálculo simples da diferença percentual do CET
    const percentDiff = ((worst.cetPercentage - best.cetPercentage) / best.cetPercentage) * 100;
    
    return { best, worst, difference, percentDiff };
  };

  const comparison = getBestAndWorst();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Simulador de Empréstimos (Educacional)</DialogTitle>
          <DialogDescription>
            Compare propostas e aprenda sobre o Custo Efetivo Total (CET)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Formulário */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
            <h3 className="text-slate-900 mb-4">Configure sua Simulação</h3>
            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sim-amount">Valor que você precisa? (R$)</Label>
                  <Input
                    id="sim-amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 10000.00"
                    required
                    className="mt-2 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="sim-installments">Em quantas parcelas?</Label>
                  <Input
                    id="sim-installments"
                    type="number"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    placeholder="Ex: 24"
                    required
                    className="mt-2 bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Calculando...' : 'Simular Comparação'}
                </Button>
                {results && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Limpar
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Alerta Educacional */}
          {comparison && (
            <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/>
                    <path d="M12 17h.01"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 mb-2">⚠️ Cuidado! A Menor Parcela NEM SEMPRE é o Melhor Negócio</h3>
                  <p className="text-slate-700 mb-3">
                    O <strong>Custo Efetivo Total (CET)</strong> do <strong>{comparison.worst.institutionName}</strong> é{' '}
                    <span className="text-red-700">{comparison.percentDiff.toFixed(0)}% maior</span> que o{' '}
                    <strong>{comparison.best.institutionName}</strong>!
                  </p>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-slate-900 mb-2">Você pagaria <strong className="text-red-600">R$ {comparison.difference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} A MAIS</strong> escolhendo a opção mais cara!</p>
                    <p className="text-slate-600">
                      💡 Sempre compare o CET, não apenas o valor da parcela. É o CET que mostra o custo real do empréstimo.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Resultados */}
          {results && results.length > 0 && (
            <div>
              <h3 className="text-slate-900 mb-4">Comparação de Propostas (Calculado via API Java)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {results.map((result, index) => {
                  const isBest = index === 0;
                  const isWorst = index === results.length - 1;
                  
                  // Lógica simples para classificar a taxa (apenas visual)
                  const rateType = result.monthlyInterestRate < 2.5 ? 'baixo' : result.monthlyInterestRate < 5 ? 'medio' : 'alto';
                  const rateColor = rateType === 'baixo' ? 'bg-green-600' : rateType === 'medio' ? 'bg-orange-600' : 'bg-red-600';
                  const rateLabel = rateType === 'baixo' ? 'Baixa' : rateType === 'medio' ? 'Média' : 'Alta';

                  return (
                    <Card 
                      key={result.institutionName}
                      className={`p-6 relative overflow-hidden ${
                        isBest 
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400' 
                          : isWorst 
                          ? 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300'
                          : 'bg-white border border-slate-200'
                      }`}
                    >
                      {isBest && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-green-600 text-white px-3 py-1 rounded-bl-lg">
                            Melhor Opção ⭐
                          </div>
                        </div>
                      )}
                      {isWorst && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-red-600 text-white px-3 py-1 rounded-bl-lg">
                            Evite! ⚠️
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <h4 className="text-slate-900 mb-1">{result.institutionName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={rateColor}>
                            {result.monthlyInterestRate}% a.m.
                          </Badge>
                          <span className="text-slate-600">
                            Taxa de Juros {rateLabel}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <span className="text-slate-600">Parcela Mensal</span>
                          <span className="text-slate-900">
                            R$ {result.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <span className="text-slate-600">Total a Pagar</span>
                          <span className="text-slate-900">
                            R$ {result.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 16v-4"/>
                              <path d="M12 8h.01"/>
                            </svg>
                            <span className="text-slate-900">CET (Custo Efetivo Total)</span>
                          </div>
                          <span className={`${isWorst ? 'text-red-700' : isBest ? 'text-green-700' : 'text-slate-900'}`}>
                            {result.cetPercentage.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Informação Educacional */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            {/* ... (O conteúdo educativo continua igual) ... */}
             <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <h4 className="text-slate-900 mb-2">📚 O que é o CET (Custo Efetivo Total)?</h4>
                <p className="text-slate-700 mb-3">
                  O CET é o <strong>indicador mais importante</strong> ao comparar empréstimos. Ele mostra o custo total do crédito, incluindo juros, taxas, seguros e todos os encargos.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-700">Compare sempre o CET entre diferentes ofertas</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}