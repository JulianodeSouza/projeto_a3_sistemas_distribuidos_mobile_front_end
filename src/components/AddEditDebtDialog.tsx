import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import api from '../utils/api';
import { toast } from 'sonner';
import type { Debt } from './Dashboard';

export interface DebtFormData {
  id?: string;
  name: string;
  amount: number;
  interestRate: number;
  installments: number;
  paidInstallments: number;
  dueDate: string;
  financialInstitutionId: number;
}

interface AddEditDebtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DebtFormData) => void;
  debt: Debt | null;
}

interface InstitutionDTO {
  id: number;
  name: string;
}

export function AddEditDebtDialog({ isOpen, onClose, onSave, debt }: AddEditDebtDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    interestRate: '',
    installments: '',
    paidInstallments: '',
    dueDate: '',
    financialInstitutionId: ''
  });

  const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);

  // 1. EFEITO APENAS PARA BUSCAR OS BANCOS
  useEffect(() => {
    if (isOpen) {
      const fetchInstitutions = async () => {
        try {
          const data = await api.get<InstitutionDTO[]>('financial-institutions');
          setInstitutions(data);
        } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar bancos.");
        }
      };
      fetchInstitutions();
    }
  }, [isOpen]);

  // 2. EFEITO SEPARADO PARA PREENCHER O FORMULÁRIO
  // Ele roda toda vez que 'debt' muda OU quando a lista de 'institutions' termina de carregar
  useEffect(() => {
    if (isOpen) {
      if (debt) {
        // Tenta achar o banco na lista carregada
        const foundInstitution = institutions.find(inst => inst.name === debt.creditor);
        
        setFormData({
          name: debt.name,
          amount: debt.amount.toString(),
          interestRate: debt.interestRate.toString(),
          installments: debt.installments.toString(),
          paidInstallments: debt.paidInstallments.toString(),
          dueDate: new Date(debt.dueDate).toISOString().split('T')[0],
          // Só preenche o ID se realmente achou o banco na lista
          financialInstitutionId: foundInstitution ? foundInstitution.id.toString() : ''
        });
      } else {
        // Modo Adicionar (Limpar)
        setFormData({
          name: '',
          amount: '',
          interestRate: '',
          installments: '',
          paidInstallments: '0',
          dueDate: '',
          financialInstitutionId: ''
        });
      }
    }
  }, [debt, isOpen, institutions]); // <--- O segredo está aqui: observamos 'institutions'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação extra antes de enviar
    if (!formData.financialInstitutionId) {
      toast.error("Selecione uma instituição financeira.");
      return;
    }

    const data: DebtFormData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate),
      installments: parseInt(formData.installments),
      paidInstallments: parseInt(formData.paidInstallments),
      dueDate: formData.dueDate,
      financialInstitutionId: parseInt(formData.financialInstitutionId)
    };

    if (debt) {
      onSave({ ...data, id: debt.id });
    } else {
      onSave(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, financialInstitutionId: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{debt ? 'Editar Dívida' : 'Adicionar Nova Dívida'}</DialogTitle>
          <DialogDescription>Preencha as informações abaixo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            
            {/* SELECT DE BANCOS */}
            <div className="grid gap-2">
              <Label>Credor (Banco)</Label>
              <Select value={formData.financialInstitutionId} onValueChange={handleSelectChange} required>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="amount">Valor Total</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="interestRate">Juros (%)</Label>
                    <Input id="interestRate" name="interestRate" type="number" step="0.01" value={formData.interestRate} onChange={handleChange} required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="installments">Parcelas</Label>
                    <Input id="installments" name="installments" type="number" value={formData.installments} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="paidInstallments">Pagas</Label>
                    <Input id="paidInstallments" name="paidInstallments" type="number" value={formData.paidInstallments} onChange={handleChange} required />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="dueDate">Vencimento</Label>
                <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}