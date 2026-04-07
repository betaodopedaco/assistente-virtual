# Assistente Virtual: Componente Web de IA

Um componente web reutilizável (**Web Component**) para integração de interfaces de chat inteligentes em qualquer aplicação web. Desenvolvido com **Vanilla JavaScript** e **Shadow DOM**, o componente oferece uma experiência de conversação premium com suporte a temas customizáveis e modo debug.

---

## 🚀 Funcionalidades

- **Web Component Reutilizável**: Encapsulado via Shadow DOM, evitando conflitos de CSS/JS.
- **Interface Futurista**: Design moderno com efeitos de partículas, overlays de grelha e brilho neon.
- **Histórico Persistente**: Armazenamento automático da conversa no `localStorage`.
- **Modo Debug**: Visualização em tempo real das respostas brutas da API.
- **Totalmente Customizável**: Atributos para configurar URL da API, título e subtítulo.
- **Responsivo**: Adaptável a diferentes tamanhos de ecrã e contentores.

## 🛠️ Tecnologias Utilizadas

- **Linguagem**: JavaScript (ES6+)
- **Arquitetura**: Custom Elements (Web Components)
- **Estilização**: CSS-in-JS (encapsulado no Shadow Root)
- **API**: Compatível com qualquer endpoint de chat RESTful.

## Status
![Status](https://img.shields.io/badge/status-concluído-brightgreen)
![Web Components](https://img.shields.io/badge/Web%20Components-EF6C00?style=flat&logo=webcomponents&logoColor=white)

Projeto focado em modularidade e interface de utilizador (UI/UX) para aplicações de inteligência artificial.

## 📦 Como Utilizar

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/betaodopedaco/assistente-virtual.git
   ```

2. Importe o script no seu HTML:
   ```html
   <script src="assistente-virtual/assistente-virtual.js"></script>
   ```

3. Adicione a tag customizada:
   ```html
   <assistente-virtual 
     api-url="SUA_API_AQUI" 
     title="Meu Assistente" 
     subtitle="IA Avançada">
   </assistente-virtual>
   ```

## 📂 Estrutura do Projeto

```text
assistente-virtual/
└── assistente-virtual/
    ├── assistente-virtual.js  # Lógica e estilos do Web Component
    ├── index.html             # Página de demonstração
    └── README.md              # Documentação
```

---
Desenvolvido por [Carlos Henrique](https://github.com/betaodopedaco)
