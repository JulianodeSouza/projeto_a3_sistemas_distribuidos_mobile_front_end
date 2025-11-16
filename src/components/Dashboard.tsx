import { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { DebtList } from './DebtList';
import { AddEditDebtDialog } from './AddEditDebtDialog';
import { SimulationDialog } from './SimulationDialog';
import { PaymentPlanDialog } from './PaymentPlanDialog';

export interface Debt {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  installments: number;
  paidInstallments: number;
  dueDate: string;
  creditor: string;
}

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: '1',
      name: 'Empréstimo Pessoal',
      amount: 15000,
      interestRate: 2.5,
      installments: 24,
      paidInstallments: 8,
      dueDate: '2025-12-15',
      creditor: 'Banco XYZ'
    },
    {
      id: '2',
      name: 'Financiamento Carro',
      amount: 45000,
      interestRate: 1.8,
      installments: 48,
      paidInstallments: 12,
      dueDate: '2028-03-20',
      creditor: 'Financeira ABC'
    },
    {
      id: '3',
      name: 'Cartão de Crédito',
      amount: 5000,
      interestRate: 8.5,
      installments: 12,
      paidInstallments: 3,
      dueDate: '2026-02-10',
      creditor: 'Banco Master'
    }
  ]);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isSimulationDialogOpen, setIsSimulationDialogOpen] = useState(false);
  const [isPaymentPlanDialogOpen, setIsPaymentPlanDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const handleAddDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debt,
      id: Date.now().toString()
    };
    setDebts([...debts, newDebt]);
    setIsAddEditDialogOpen(false);
  };

  const handleEditDebt = (debt: Debt) => {
    setDebts(debts.map(d => d.id === debt.id ? debt : d));
    setEditingDebt(null);
    setIsAddEditDialogOpen(false);
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const openEditDialog = (debt: Debt) => {
    setEditingDebt(debt);
    setIsAddEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingDebt(null);
    setIsAddEditDialogOpen(true);
  };

  const closeAddEditDialog = () => {
    setEditingDebt(null);
    setIsAddEditDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900">Dashboard de Empréstimos</h1>
              <p className="mt-1 text-slate-600">
                Gerencie suas dívidas e planeje sua quitação
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                <span className="text-slate-700">
                  {new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DashboardStats debts={debts} />

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => setIsPaymentPlanDialogOpen(true)}
            className="flex-1 min-w-[250px] bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M9 15h6"/>
                <path d="M9 18h6"/>
              </svg>
              <span>Gerar Plano de Quitação</span>
            </div>
          </button>

          <button
            onClick={() => setIsSimulationDialogOpen(true)}
            className="flex-1 min-w-[250px] bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
              <span>Simular Empréstimo</span>
            </div>
          </button>
        </div>

        <DebtList
          debts={debts}
          onEdit={openEditDialog}
          onDelete={handleDeleteDebt}
          onAdd={openAddDialog}
        />
      </main>

      <AddEditDebtDialog
        isOpen={isAddEditDialogOpen}
        onClose={closeAddEditDialog}
        onSave={editingDebt ? handleEditDebt : handleAddDebt}
        debt={editingDebt}
      />

      <SimulationDialog
        isOpen={isSimulationDialogOpen}
        onClose={() => setIsSimulationDialogOpen(false)}
      />

      <PaymentPlanDialog
        isOpen={isPaymentPlanDialogOpen}
        onClose={() => setIsPaymentPlanDialogOpen(false)}
        debts={debts}
      />
    </div>
  );
}
