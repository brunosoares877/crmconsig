# Funcionalidade de Seleção Múltipla de Leads

## Visão Geral
Foi implementada uma nova funcionalidade que permite selecionar múltiplos leads e excluí-los em massa, facilitando o gerenciamento de grandes volumes de dados.

## Como Usar

### 1. Ativando o Modo de Seleção
- Na página de Leads, clique no botão **"Selecionar"** no canto superior direito
- O botão mudará para **"Cancelar"** e checkboxes aparecerão em cada card de lead

### 2. Selecionando Leads
- **Individual**: Clique no checkbox de cada lead que deseja selecionar
- **Todos**: Use o checkbox "Selecionar todos" no cabeçalho para selecionar/deselecionar todos os leads da página atual
- **Visual**: Leads selecionados ficam destacados com uma borda azul

### 3. Excluindo Múltiplos Leads
- Após selecionar os leads desejados, clique no botão **"Excluir (X)"** que aparece ao lado do "Selecionar todos"
- Confirme a ação no modal de confirmação
- Os leads serão movidos para a lixeira (não deletados permanentemente)

### 4. Cancelando a Seleção
- Clique no botão **"Cancelar"** para sair do modo de seleção
- Todas as seleções serão desmarcadas

## Características Técnicas

### Segurança
- Os leads são movidos para a lixeira, não deletados permanentemente
- Ficam disponíveis por 30 dias na lixeira antes da exclusão automática
- Confirmação obrigatória antes da exclusão

### Interface
- Modo visual claro com checkboxes e bordas destacadas
- Contador de leads selecionados no botão de exclusão
- Feedback visual em tempo real
- Responsivo para dispositivos móveis

### Performance
- Operação otimizada para múltiplos registros
- Transação única no banco de dados
- Estados gerenciados adequadamente para evitar inconsistências

## Benefícios
- **Produtividade**: Exclui múltiplos leads de uma vez
- **Facilidade**: Interface intuitiva e simples
- **Segurança**: Exclusão segura com possibilidade de recuperação
- **Controle**: Seleção granular com opção "selecionar todos"

## URLs de Acesso
- **Desenvolvimento**: http://localhost:8082
- **Produção**: https://crmconsig-1hn13ueyr-leadconsigs-projects.vercel.app

## Commit
```
git commit 7792994: "Adicionada funcionalidade de seleção múltipla para excluir leads em massa"
```

---
*Implementado em: Dezembro 2024* 