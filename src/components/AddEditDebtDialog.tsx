import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { Debt } from '../App';

interface AddEditDebtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: Debt | Omit<Debt, 'id'>) => void;
  debt: Debt | null;
}

export function AddEditDebtDialog({ isOpen, onClose, onSave, debt }: AddEditDebtDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    interestRate: '',
    installments: '',
    paidInstallments: '',
    dueDate: '',
    creditor: ''
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name,
        amount: debt.amount.toString(),
        interestRate: debt.interestRate.toString(),
        installments: debt.installments.toString(),
        paidInstallments: debt.paidInstallments.toString(),
        dueDate: debt.dueDate,
        creditor: debt.creditor
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        interestRate: '',
        installments: '',
        paidInstallments: '0',
        dueDate: '',
        creditor: ''
      });
    }
  }, [debt, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const debtData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate),
      installments: parseInt(formData.installments),
      paidInstallments: parseInt(formData.paidInstallments),
      dueDate: formData.dueDate,
      creditor: formData.creditor
    };

    if (debt) {
      onSave({ ...debtData, id: debt.id });
    } else {
      onSave(debtData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{debt ? 'Editar Dívida' : 'Adicionar Nova Dívida'}</DialogTitle>
          <DialogDescription>
            {debt 
              ? 'Atualize as informações da sua dívida abaixo.' 
              : 'Preencha as informações do empréstimo que deseja cadastrar.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Empréstimo</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Empréstimo Pessoal"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="creditor">Credor</Label>
              <Input
                id="creditor"
                name="creditor"
                value={formData.creditor}
                onChange={handleChange}
                placeholder="Ex: Banco XYZ"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor Total (R$)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="10000.00"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interestRate">Taxa de Juros (% a.m.)</Label>
                <Input
                  id="interestRate"
                  name="interestRate"
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={handleChange}
                  placeholder="2.5"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="installments">Total de Parcelas</Label>
                <Input
                  id="installments"
                  name="installments"
                  type="number"
                  value={formData.installments}
                  onChange={handleChange}
                  placeholder="24"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paidInstallments">Parcelas Pagas</Label>
                <Input
                  id="paidInstallments"
                  name="paidInstallments"
                  type="number"
                  value={formData.paidInstallments}
                  onChange={handleChange}
                  placeholder="5"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Data de Vencimento Final</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {debt ? 'Salvar Alterações' : 'Adicionar Dívida'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
