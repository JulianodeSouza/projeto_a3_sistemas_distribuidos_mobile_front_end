import { DebtCard } from './DebtCard';
import type { Debt } from '../App';

interface DebtListProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function DebtList({ debts, onEdit, onDelete, onAdd }: DebtListProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-slate-900">Minhas Dívidas</h2>
          <p className="text-slate-600 mt-1">
            {debts.length} {debts.length === 1 ? 'empréstimo cadastrado' : 'empréstimos cadastrados'}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
          Adicionar Dívida
        </button>
      </div>

      {debts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-slate-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
                <line x1="9" x2="9.01" y1="9" y2="9"/>
                <line x1="15" x2="15.01" y1="9" y2="9"/>
              </svg>
            </div>
          </div>
          <h3 className="text-slate-900 mb-2">Nenhuma dívida cadastrada</h3>
          <p className="text-slate-600 mb-6">
            Comece adicionando seu primeiro empréstimo para acompanhar suas finanças
          </p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
            Adicionar Primeira Dívida
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debts.map(debt => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onEdit={() => onEdit(debt)}
              onDelete={() => onDelete(debt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
