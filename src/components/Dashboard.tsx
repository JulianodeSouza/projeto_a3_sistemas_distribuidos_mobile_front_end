import { useState, useEffect } from 'react';
import { DashboardStats } from './DashboardStats';
import { DebtList } from './DebtList';
import { AddEditDebtDialog, DebtFormData } from './AddEditDebtDialog';
import { SimulationDialog } from './SimulationDialog';
import { PaymentPlanDialog } from './PaymentPlanDialog';
import api from '../utils/api';
import { toast } from 'sonner';

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

interface DebtResponseDTO {
  id: number;
  debtName: string;
  totalDebt: number;
  monthlyInterestRate: number;
  totalInstallments: number;
  installmentsPaid: number;
  dueDate: string;
  financialInstitutionName: string;
}

interface UserDTO {
  id: number;
  name: string;
  email: string;
}

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [userName, setUserName] = useState("Usuário");
  const [isLoading, setIsLoading] = useState(true);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isSimulationDialogOpen, setIsSimulationDialogOpen] = useState(false);
  const [isPaymentPlanDialogOpen, setIsPaymentPlanDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const userData = await api.get<UserDTO>('users/me');
      setUserName(userData.name);

      const debtsData = await api.get<DebtResponseDTO[]>('debt');
      
      const mappedDebts: Debt[] = debtsData.map(dto => ({
        id: dto.id.toString(),
        name: dto.debtName,
        amount: dto.totalDebt,
        interestRate: dto.monthlyInterestRate,
        installments: dto.totalInstallments,
        paidInstallments: dto.installmentsPaid,
        dueDate: dto.dueDate,
        creditor: dto.financialInstitutionName
      }));

      setDebts(mappedDebts);

    } catch (error: any) {
      console.error(error);
      if (error?.status === 403) {
        toast.error("Sessão expirada. Faça login novamente.");
        onLogout();
      } else {
        toast.error("Erro ao carregar dados do painel.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveDebt = async (formData: DebtFormData) => {
    try {
      const payload = {
        debtName: formData.name,
        totalDebt: formData.amount,
        monthlyInterestRate: formData.interestRate,
        totalInstallments: formData.installments,
        installmentsPaid: formData.paidInstallments,
        dueDate: formData.dueDate,
        financialInstitutionId: formData.financialInstitutionId
      };

      if (formData.id) {
        
        await api.put(`debt/${formData.id}`, payload);
        toast.success("Dívida atualizada com sucesso!");
      } else {
        
        await api.post('debt', payload);
        toast.success("Dívida criada com sucesso!");
      }

      setIsAddEditDialogOpen(false);
      setEditingDebt(null);
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar dívida.");
    }
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      await api.del(`debt/${id}`);
      setDebts(debts.filter(d => d.id !== id));
      toast.success("Dívida removida.");
    } catch (error) {
      toast.error("Erro ao remover dívida.");
    }
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

  if (isLoading) return <div className="flex justify-center items-center h-screen text-slate-600">Carregando seu painel...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard QuitaJá</h1>
              <p className="mt-1 text-slate-600">
                Gerencie suas dívidas e planeje sua quitação
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-blue-600 mb-1">
                Bem vindo de volta, {userName}
              </p>
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                <span className="text-slate-700 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              
              <button
                onClick={onLogout}
                className="text-slate-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DashboardStats debts={debts} />

        <div className="mt-8 flex flex-wrap gap-6">
          <button
            onClick={() => setIsPaymentPlanDialogOpen(true)}
            className="flex-1 min-w-[250px] bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M9 15h6"/>
                  <path d="M9 18h6"/>
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-sm opacity-90">Estratégia Inteligente</span>
                <span className="text-lg font-bold">Gerar Plano de Quitação</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsSimulationDialogOpen(true)}
            className="flex-1 min-w-[250px] bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-sm opacity-90">Comparar Taxas</span>
                <span className="text-lg font-bold">Simular Empréstimo</span>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8">
          <DebtList
            debts={debts}
            onEdit={openEditDialog}
            onDelete={handleDeleteDebt}
            onAdd={openAddDialog}
          />
        </div>
      </main>

      <AddEditDebtDialog
        isOpen={isAddEditDialogOpen}
        onClose={closeAddEditDialog}
        onSave={handleSaveDebt}
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