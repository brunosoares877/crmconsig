import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface QuickAddContactProps {
    onContactAdded: () => void;
}

export const QuickAddContact: React.FC<QuickAddContactProps> = ({ onContactAdded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !phone.trim()) {
            toast.error('Nome e telefone são obrigatórios');
            return;
        }

        setLoading(true);

        try {
            const fallbackUserId = 'a2ed7ace-1702-4051-b1e2-f17540dc0b14';

            const { data, error } = await supabase
                .from('leads')
                .insert({
                    name: name.trim(),
                    phone: phone.trim(),
                    status: 'novo',
                    source: 'manual',
                    user_id: fallbackUserId
                })
                .select()
                .single();

            if (error) throw error;

            toast.success(`Contato ${name} adicionado com sucesso!`);
            setName('');
            setPhone('');
            setIsOpen(false);
            onContactAdded();
        } catch (error: any) {
            console.error('Error creating contact:', error);
            toast.error('Erro ao criar contato: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                <UserPlus className="h-4 w-4 mr-1" />
                Novo Contato
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Contato</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome *</Label>
                            <Input
                                id="name"
                                placeholder="Nome do contato"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone *</Label>
                            <Input
                                id="phone"
                                placeholder="(11) 99999-9999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Adicionar'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
