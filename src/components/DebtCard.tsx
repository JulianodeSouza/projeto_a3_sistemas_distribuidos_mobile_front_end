import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import type { Debt } from '../App';

interface DebtCardProps {
  debt: Debt;
  onEdit: () => void;
  onDelete: () => void;
}

export function DebtCard({ debt, onEdit, onDelete }: DebtCardProps) {
  const progress = (debt.paidInstallments / debt.installments) * 100;
  const installmentValue = debt.amount / debt.installments;
  const totalPaid = installmentValue * debt.paidInstallments;
  const remaining = debt.amount - totalPaid;

  return (
    <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-slate-900 mb-1">{debt.name}</h3>
          <p className="text-slate-600">{debt.creditor}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            aria-label="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-blue-600">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                aria-label="Excluir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-red-600">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir "{debt.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Valor Total</span>
          <span className="text-slate-900">
            R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600">Taxa de Juros</span>
          <span className="text-slate-900">{debt.interestRate}% a.m.</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600">Parcelas</span>
          <span className="text-slate-900">
            {debt.paidInstallments}/{debt.installments}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Progresso</span>
            <span className="text-slate-900">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Pago</span>
            <span className="text-green-600">
              R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Restante</span>
            <span className="text-orange-600">
              R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <span>
              Vencimento: {new Date(debt.dueDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
