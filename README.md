# SOC Simulator: Pipeline Híbrido 🛡️🤖

Um simulador interativo de pipeline de detecção para Centros de Operações de Segurança (SOC), desenvolvido em HTML5 Canvas, Vanilla CSS, Tailwind CSS e Vanilla JavaScript.

O projeto simula um fluxo de tráfego de rede passando por duas camadas principais de defesa:
1. **Regras Estáticas (Firewall)**: Filtra ameaças conhecidas e óbvias por assinatura (ex: SQL Injection, XSS) em tempo real.
2. **Heurística (LLM Local)**: Analisa logs de anomalias mais complexas e comportamentos furtivos (ex: Brute Force lento) por meio de uma fila de análise heurística.

---

## 🚀 Funcionalidades

- **Injeção Dinâmica de Eventos**: Botões para injetar tráfego Legítimo, Ataques Óbvios ou Ataques Furtivos na rede.
- **Visualização com Canvas**: Animação em tempo real que exibe os pacotes trafegando, sendo bloqueados pelo Firewall ou sendo enfileirados para análise da IA.
- **Terminal de Saída do LLM**: Simulação em formato JSON contendo o diagnóstico de ameaças críticas detectadas pelo LLM Local e ações de resposta automatizadas (como banimento de IP e alertas via Telegram).
- **Controle de Volume e Velocidade**: Sliders interativos para ajustar o volume do tráfego geral e simular a velocidade de processamento da IA (ideal para testar gargalos de fila).

---

## 📁 Estrutura do Projeto

A estrutura foi modularizada para melhor manutenção e legibilidade do código:

```
Simulador/
├── css/
│   └── style.css              # Estilos personalizados e animações extras
├── js/
│   └── script.js              # Toda a lógica da simulação do Canvas e interface
└── simulador_de_soc_local.html # Estrutura da página HTML
```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & Semantic HTML**
- **JavaScript (ES6+)**
- **HTML5 Canvas API** (para renderização gráfica dos pacotes)
- **Tailwind CSS** (para estilização rápida e design responsivo)
- **Google Fonts** (Fonte *Inter*)

---

## 💻 Como Executar

Basta abrir o arquivo `simulador_de_soc_local.html` em qualquer navegador web moderno! Não é necessário servidor web ou compilação local.
