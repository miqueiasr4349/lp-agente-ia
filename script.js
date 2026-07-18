document.addEventListener('DOMContentLoaded', () => {
  // Estado do formulário
  const formData = {
    nome: '',
    telefone: '',
    notebook: '',
    investimento: '',
    usaIA: '',
    posicao: ''
  };

  let currentStep = 1;
  const totalSteps = 5;

  // Seletores de elementos
  const card = document.getElementById('card');
  const cardHead = document.querySelector('.card-head');
  const stepNowEl = document.getElementById('stepNow');
  const stepTotalEl = document.getElementById('stepTotal');
  const progressFill = document.getElementById('progressFill');

  // Elementos do Passo 1
  const inputNome = document.getElementById('nome');
  const inputTelefone = document.getElementById('telefone');
  const btnNextStep1 = document.querySelector('[data-step="1"] .btn-next');

  // Inicializa o total de passos no cabeçalho
  if (stepTotalEl) {
    stepTotalEl.textContent = totalSteps;
  }

  // ==========================================================================
  // 1. MÁSCARA E VALIDAÇÃO DO WHATSAPP (PASSO 1)
  // ==========================================================================

  // Aplica máscara ao telefone em tempo real
  inputTelefone.addEventListener('input', (e) => {
    let value = e.target.value;
    
    // Remove todos os caracteres não numéricos
    value = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DD + 9 dígitos)
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Aplica a formatação
    if (value.length > 10) {
      // Celular: (XX) XXXXX-XXXX
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
      // Telefone fixo provisório: (XX) XXXX-XXXX
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length > 2) {
      // DDD + primeiros dígitos: (XX) XXXX
      value = value.replace(/^(\d{2})(\d{0,4})$/, '($1) $2');
    } else if (value.length > 0) {
      // Apenas DDD: (XX
      value = value.replace(/^(\d*)$/, '($1');
    }
    
    e.target.value = value;
    validarPasso1();
  });

  inputNome.addEventListener('input', validarPasso1);

  // Valida os campos da primeira etapa
  function validarPasso1() {
    const nomeVal = inputNome.value.trim();
    const telClean = inputTelefone.value.replace(/\D/g, '');
    
    // Nome deve ter pelo menos 3 caracteres e WhatsApp deve ter 11 dígitos
    const isNomeValido = nomeVal.length >= 3;
    const isTelefoneValido = telClean.length === 11;
    
    if (isNomeValido && isTelefoneValido) {
      btnNextStep1.removeAttribute('disabled');
    } else {
      btnNextStep1.setAttribute('disabled', 'true');
    }
  }

  // Ação do botão Continuar na Etapa 1
  btnNextStep1.addEventListener('click', () => {
    formData.nome = inputNome.value.trim();
    formData.telefone = inputTelefone.value.replace(/\D/g, '');
    
    avancarEtapa();
  });

  // ==========================================================================
  // 2. OPÇÕES COM SELEÇÃO E AUTO-AVANÇO (PASSOS 2 A 5)
  // ==========================================================================
  const optionButtons = document.querySelectorAll('.option');

  optionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Identifica o campo correspondente através do container pai
      const parentOptions = button.closest('.options');
      const fieldName = parentOptions.getAttribute('data-field');
      const val = button.getAttribute('data-value');

      // Se o botão já estiver selecionado, não faz nada
      if (button.classList.contains('is-selected')) return;

      // Remove seleção anterior dos botões do mesmo grupo
      parentOptions.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('is-selected');
      });

      // Adiciona seleção ao botão clicado
      button.classList.add('is-selected');
      
      // Salva a resposta no formulário
      formData[fieldName] = val;

      // Avanço automático com delay de 350ms (Técnica Inlead de visual feedback)
      setTimeout(() => {
        avancarEtapa();
      }, 350);
    });
  });

  // ==========================================================================
  // 3. CONTROLE DE ETAPAS E NAVEGAÇÃO COM TRANSIÇÃO SUAVE
  // ==========================================================================
  
  function avancarEtapa() {
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    } else if (currentStep === totalSteps) {
      // Chegou ao fim das perguntas, vai para a tela de análise por IA
      goToStep('loading');
    }
  }

  function goToStep(nextStep, onDone) {
    const currentStepEl = document.querySelector(`.step[data-step="${currentStep}"]`);
    const nextStepEl = document.querySelector(`.step[data-step="${nextStep}"]`);

    if (!currentStepEl || !nextStepEl) return;

    // Transição de saída
    currentStepEl.classList.add('is-exiting');

    setTimeout(() => {
      // Remove classes ativas da etapa anterior
      currentStepEl.classList.remove('is-active', 'is-exiting');
      
      // Atualiza o estado da etapa atual
      currentStep = nextStep;
      
      // Ativa a próxima etapa
      nextStepEl.classList.add('is-active');

      // Atualiza o cabeçalho e progresso se for uma etapa numérica
      if (typeof nextStep === 'number') {
        if (cardHead) cardHead.style.display = 'grid';
        if (stepNowEl) stepNowEl.textContent = nextStep;
        
        // Calcula a porcentagem do preenchimento da barra
        const progressPct = (nextStep / totalSteps) * 100;
        if (progressFill) {
          progressFill.style.width = `${progressPct}%`;
        }
      } else {
        // Se for "loading" ou tela de resultado, oculta o cabeçalho do card para focar na resposta
        if (cardHead) cardHead.style.display = 'none';
      }

      // Se for a tela de processamento da IA, inicia a simulação
      if (nextStep === 'loading') {
        iniciarAnaliseIA();
      }

      // Chama o callback APÓS o DOM estar atualizado
      if (typeof onDone === 'function') onDone();

    }, 380);
  }

  // ==========================================================================
  // 4. SIMULAÇÃO DE ANÁLISE POR IA (TELA DE CARREGAMENTO)
  // ==========================================================================
  
  function iniciarAnaliseIA() {
    const statusEl = document.getElementById('loadingStatus');
    const barFillEl = document.getElementById('loadingBarFill');
    
    // Status text dinâmico simulando rede neural
    const statusMessages = [
      { time: 0, text: 'Avaliando dados do candidato...' },
      { time: 700, text: 'Verificando requisitos técnicos de hardware...' },
      { time: 1400, text: 'Analisando viabilidade de investimento em IA...' },
      { time: 2100, text: 'Calculando compatibilidade da turma...' }
    ];

    // Adiciona classe de animação ao texto
    statusEl.classList.add('pulse-text');

    statusMessages.forEach(msg => {
      setTimeout(() => {
        if (statusEl) statusEl.textContent = msg.text;
      }, msg.time);
    });

    // Animação da barra de preenchimento de carregamento (3 segundos)
    let percent = 0;
    const duration = 2800; // Tempo total em ms
    const intervalTime = 30; // Atualiza a cada 30ms
    const step = (intervalTime / duration) * 100;
    
    const loadingTimer = setInterval(() => {
      percent += step;
      if (percent >= 100) {
        percent = 100;
        clearInterval(loadingTimer);
        
        // Finaliza a simulação e avalia a qualificação do lead
        setTimeout(() => {
          avaliarQualificacao();
        }, 300);
      }
      if (barFillEl) barFillEl.style.width = `${percent}%`;
    }, intervalTime);
  }

  // ==========================================================================
  // 5. LÓGICA DE QUALIFICAÇÃO DO LEAD
  // ==========================================================================
  
  function avaliarQualificacao() {
    const temNotebook   = formData.notebook === 'sim';
    const vamoInvestir  = formData.investimento === 'sim';
    const isQualificado = temNotebook && vamoInvestir;

    // Monta a URL do WhatsApp com mensagem personalizada
    const primeiroNome = formData.nome.split(' ')[0];
    const textParam    = encodeURIComponent(
      `Olá! Acabei de preencher o formulário de pré-inscrição da Imersão Agente IA. Meu nome é ${formData.nome} e meu WhatsApp é ${formData.telefone}. Fui aprovado(a) e gostaria de saber os próximos passos!`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=556692715486&text=${textParam}`;

    if (isQualificado) {
      // Personaliza o nome na tela de sucesso
      const nomeEl = document.getElementById('nomeQualificado');
      if (nomeEl) nomeEl.textContent = `${primeiroNome}! 🎉`;

      // Seta o href do botão manual do WhatsApp
      const btnWA = document.getElementById('btnWhatsApp');
      if (btnWA) btnWA.href = whatsappUrl;

      // ── WEBHOOK: Envia dados do lead qualificado para o n8n ─────────────────
      const webhookPayload = {
        nome: formData.nome,
        telefone: formData.telefone,
        notebook: formData.notebook,
        investimento: formData.investimento,
        usaIA: formData.usaIA,
        posicao: formData.posicao,
        status: 'qualified',
        timestamp: new Date().toISOString()
      };

      fetch('https://merit-n8n.jcspip.easypanel.host/webhook/0ac84750-cd20-4836-9881-6ce9ca248789', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      })
      .then(res => {
        console.log('[WEBHOOK] Resposta:', res.status, res.statusText);
      })
      .catch(err => {
        console.warn('[WEBHOOK] Erro (tentando no-cors):', err.message);
        // Fallback: tenta sem CORS (o navegador não lê a resposta, mas o POST chega)
        fetch('https://merit-n8n.jcspip.easypanel.host/webhook/0ac84750-cd20-4836-9881-6ce9ca248789', {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(webhookPayload)
        })
        .then(() => console.log('[WEBHOOK] Enviado via no-cors (sem confirmação de resposta)'))
        .catch(e => console.error('[WEBHOOK] Falha total:', e.message));
      });
      // ────────────────────────────────────────────────────────────────────────

      // ── META PIXEL: Dispara evento Lead quando qualificado ──────────────────
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name : 'Imersão Agente IA — Pré-inscrição',
          content_category: 'Qualificado',
          status       : 'qualified',
          value        : 0.00,
          currency     : 'BRL'
        });
      }
      // ────────────────────────────────────────────────────────────────────────

      // Exibe a tela de qualificado e inicia timer APÓS o DOM estar pronto
      goToStep('qualified', () => {
        const TOTAL_SECONDS = 5;
        let secondsLeft = TOTAL_SECONDS;

        const countdownEl = document.getElementById('countdown');
        const barFillEl   = document.getElementById('redirectBarFill');

        // Garante que o botão está com o href correto (DOM já está ativo)
        const btnWAReady = document.getElementById('btnWhatsApp');
        if (btnWAReady) btnWAReady.href = whatsappUrl;

        function atualizarBarra() {
          const pct = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;
          if (barFillEl) barFillEl.style.width = pct + '%';
          if (countdownEl) countdownEl.textContent = secondsLeft;
        }

        atualizarBarra();

        const timer = setInterval(() => {
          secondsLeft--;
          atualizarBarra();

          if (secondsLeft <= 0) {
            clearInterval(timer);
            window.location.href = whatsappUrl;
          }
        }, 1000);
      });

    } else {
      // Motivo de recusa personalizado
      const reasonEl = document.getElementById('unqualifiedReason');
      if (reasonEl) {
        if (!temNotebook && !vamoInvestir) {
          reasonEl.innerHTML = 'A Imersão Agente IA exige <strong>notebook próprio em sala</strong> e <strong>investimento mínimo em licenças de IA</strong> para o seu Agente funcionar de verdade — sem esses dois pontos, a experiência fica incompleta.';
        } else if (!temNotebook) {
          reasonEl.innerHTML = 'A Imersão Agente IA exige <strong>notebook próprio em sala</strong>, pois você irá construir e deixar o seu Agente de IA rodando ao vivo durante os 2 dias — sem isso, você não conseguirá acompanhar as práticas.';
        } else {
          reasonEl.innerHTML = 'A Imersão Agente IA exige <strong>investimento em licenças de IA</strong> (acima de R$ 500), pois seu Agente precisará de ferramentas pagas para rodar 24h por dia no seu negócio.';
        }
      }

      // Cria o container de contagem regressiva para não-qualificado (vermelho)
      const unqualifiedSection = document.querySelector('[data-step="unqualified"]');
      let redirectContainer = document.getElementById('unqualifiedRedirectContainer');
      if (!redirectContainer && unqualifiedSection) {
        redirectContainer = document.createElement('div');
        redirectContainer.id = 'unqualifiedRedirectContainer';
        redirectContainer.className = 'redirect-bar-wrapper';
        redirectContainer.innerHTML = `
          <span class="redirect-bar-label" style="color:#ff4a5a;">
            Redirecionando para a página de contato em <strong id="unqualifiedCountdown" style="color:#ff4a5a; font-family:var(--font-title);">4</strong>s...
          </span>
          <div class="redirect-bar-track">
            <div class="redirect-bar-fill" id="unqualifiedBarFill" style="background:linear-gradient(90deg,#ff4a5a 0%,#ff8c69 100%); box-shadow:0 0 8px rgba(255,74,90,0.6);"></div>
          </div>`;
        unqualifiedSection.appendChild(redirectContainer);
      }

      // Exibe a tela de não-qualificado e inicia timer APÓS o DOM estar pronto
      goToStep('unqualified', () => {
        const TOTAL_UQ = 4;
        let uqLeft = TOTAL_UQ;
        const uqCountEl = document.getElementById('unqualifiedCountdown');
        const uqBarEl   = document.getElementById('unqualifiedBarFill');

        function atualizarBarraUQ() {
          const pct = ((TOTAL_UQ - uqLeft) / TOTAL_UQ) * 100;
          if (uqBarEl) uqBarEl.style.width = pct + '%';
          if (uqCountEl) uqCountEl.textContent = uqLeft;
        }

        atualizarBarraUQ();

        const timerUQ = setInterval(() => {
          uqLeft--;
          atualizarBarraUQ();

          if (uqLeft <= 0) {
            clearInterval(timerUQ);
            window.location.href = 'obrigado.html';
          }
        }, 1000);
      });
    }
  }
});
