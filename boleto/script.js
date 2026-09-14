/**
 * GORDINHO CELULARES - LANDING PAGE GOOGLE ADS ENGINE
 * 100% Celulares no Boleto Bancário
 * 
 * Funcionalidades:
 * - Alternador de Tema (Dark / Light Mode)
 * - Captura e Rastreamento de UTMs e GCLID do Google Ads
 * - Simulador de Parcelas no Boleto em Tempo Real
 * - Integração dos Cards da Vitrine com o Simulador
 * - Máscara Inteligente de WhatsApp e CPF
 * - Validação em Tempo Real com Foco Acessível
 * - Envio Automático para Google Sheets (Lead Backup)
 * - Redirecionamento Anti-Popup para o WhatsApp da Loja
 * - Disparo de Eventos no Google Tag Manager (dataLayer) e Meta Pixel
 * - FAQ Acordeão com Acessibilidade ARIA
 * - Modal de Políticas e Disclaimers Financeiros
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constantes da Loja
  const STORE_WHATSAPP_NUMBER = '5567992451418'; // (67) 99245-1418
  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyXFuEbKpKCLGWKCsW2Gg369w7UwKl3PQDomJIwjtYDnv2YeKiVp9p-rJ65vS676i7x/exec';

  /* --------------------------------------------------------------------------
     1. Captura de Parâmetros UTM e Google Ads (GCLID)
     -------------------------------------------------------------------------- */
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source') || sessionStorage.getItem('gc_utm_source') || 'google_ads';
  const utmMedium = urlParams.get('utm_medium') || sessionStorage.getItem('gc_utm_medium') || 'cpc';
  const utmCampaign = urlParams.get('utm_campaign') || sessionStorage.getItem('gc_utm_campaign') || 'campanha_boleto';
  const utmTerm = urlParams.get('utm_term') || sessionStorage.getItem('gc_utm_term') || '';
  const utmContent = urlParams.get('utm_content') || sessionStorage.getItem('gc_utm_content') || '';
  const gclid = urlParams.get('gclid') || sessionStorage.getItem('gc_gclid') || '';

  // Persiste na sessão para não perder caso o usuário recarregue a página
  try {
    sessionStorage.setItem('gc_utm_source', utmSource);
    sessionStorage.setItem('gc_utm_medium', utmMedium);
    sessionStorage.setItem('gc_utm_campaign', utmCampaign);
    if (utmTerm) sessionStorage.setItem('gc_utm_term', utmTerm);
    if (utmContent) sessionStorage.setItem('gc_utm_content', utmContent);
    if (gclid) sessionStorage.setItem('gc_gclid', gclid);
  } catch (e) {
    console.warn('SessionStorage indisponível:', e);
  }

  /* --------------------------------------------------------------------------
     2. Motor de Tema Claro / Escuro (Theme Switcher)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const metaThemeColor = document.getElementById('meta-theme-color');

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('gordinho_theme', theme);
    } catch (e) {}

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'light' ? '#f8fafc' : '#09090b');
    }
  };

  const initTheme = () => {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem('gordinho_theme');
    } catch (e) {}
    setTheme(savedTheme || 'dark');
  };

  initTheme();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      themeToggleBtn.style.transform = 'scale(0.92)';
      setTimeout(() => { themeToggleBtn.style.transform = ''; }, 150);
    });
  }

  /* --------------------------------------------------------------------------
     3. Header Scrolled & Barra Fixa Mobile (Sticky CTA)
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const mobileStickyBar = document.getElementById('mobile-sticky-cta');

  const handleScroll = () => {
    const scrollPos = window.scrollY;

    if (navbar) {
      if (scrollPos > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    if (mobileStickyBar) {
      if (scrollPos > 320) {
        mobileStickyBar.classList.add('visible');
      } else {
        mobileStickyBar.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* --------------------------------------------------------------------------
     4. Seleção de Modelos da Vitrine & Foco no Pré-Cadastro
     -------------------------------------------------------------------------- */
  const formSection = document.getElementById('pre-cadastro');
  const inputProdutoInteresse = document.getElementById('lead-produto-interesse');
  const selectFaixaValor = document.getElementById('lead-faixa-valor');
  const inputNome = document.getElementById('lead-nome');

  let currentModel = 'Xiaomi Redmi Note 15';
  let currentPrice = 1499;

  const populateFormAndScroll = (modelName, priceVal) => {
    currentModel = modelName;
    currentPrice = priceVal;

    if (inputProdutoInteresse) {
      inputProdutoInteresse.value = `${modelName} (em até 18x no boleto)`;
    }

    if (selectFaixaValor) {
      if (priceVal <= 1000) selectFaixaValor.value = 'Até R$ 1.000';
      else if (priceVal <= 1500) selectFaixaValor.value = 'R$ 1.000 a R$ 1.500';
      else if (priceVal <= 2500) selectFaixaValor.value = 'R$ 1.500 a R$ 2.500';
      else if (priceVal <= 4000) selectFaixaValor.value = 'R$ 2.500 a R$ 4.000';
      else selectFaixaValor.value = 'Acima de R$ 4.000';
    }

    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        const cardBox = formSection.querySelector('.lead-card-box');
        if (cardBox) {
          cardBox.style.borderColor = 'var(--emerald-neon)';
          cardBox.style.boxShadow = '0 0 40px rgba(0, 255, 136, 0.4)';
          if (inputNome) inputNome.focus();

          setTimeout(() => {
            cardBox.style.borderColor = '';
            cardBox.style.boxShadow = '';
          }, 1800);
        }
      }, 550);
    }
  };

  // Cards da Vitrine
  document.querySelectorAll('.btn-select-model').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modelName = btn.getAttribute('data-model');
      const modelPrice = parseInt(btn.getAttribute('data-price') || '1499', 10);

      // Dispara evento para GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'selecionar_modelo_vitrine',
          modelo: modelName,
          valor: modelPrice
        });
      }

      populateFormAndScroll(modelName, modelPrice);
    });
  });

  /* --------------------------------------------------------------------------
     5. Máscara de Telefone e CPF
     -------------------------------------------------------------------------- */
  const inputWhatsapp = document.getElementById('lead-whatsapp');
  const inputCpf = document.getElementById('lead-cpf');

  const applyPhoneMask = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length >= 12) digits = digits.substring(2);
    if (digits.length > 11) digits = digits.substring(0, 11);

    if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const applyCpfMask = (value) => {
    const digits = value.replace(/\D/g, '').substring(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  if (inputWhatsapp) {
    inputWhatsapp.addEventListener('input', (e) => {
      e.target.value = applyPhoneMask(e.target.value);
      clearError(inputWhatsapp.closest('.form-group'));
    });
  }

  if (inputCpf) {
    inputCpf.addEventListener('input', (e) => {
      e.target.value = applyCpfMask(e.target.value);
      clearError(inputCpf.closest('.form-group'));
    });
  }

  /* --------------------------------------------------------------------------
     6. Validação e Feedback do Formulário
     -------------------------------------------------------------------------- */
  const form = document.getElementById('form-simulador-boleto');
  const selectRestricao = document.getElementById('lead-restricao');
  const checkboxConsent = document.getElementById('lead-consent');

  const showError = (formGroup, msg = null) => {
    if (!formGroup) return;
    formGroup.classList.add('has-error');
    if (msg) {
      const err = formGroup.querySelector('.form-error-msg');
      if (err) err.textContent = msg;
    }
  };

  const clearError = (formGroup) => {
    if (!formGroup) return;
    formGroup.classList.remove('has-error');
  };

  if (inputNome) inputNome.addEventListener('input', () => clearError(inputNome.closest('.form-group')));
  if (selectFaixaValor) selectFaixaValor.addEventListener('change', () => clearError(selectFaixaValor.closest('.form-group')));
  if (selectRestricao) selectRestricao.addEventListener('change', () => clearError(selectRestricao.closest('.form-group')));
  if (checkboxConsent) checkboxConsent.addEventListener('change', () => clearError(checkboxConsent.closest('.form-group')));

  const validateForm = () => {
    let isValid = true;

    // Nome
    const nomeVal = inputNome ? inputNome.value.trim() : '';
    if (!nomeVal || nomeVal.length < 3) {
      showError(inputNome.closest('.form-group'), 'Por favor, informe seu nome completo.');
      isValid = false;
    } else {
      clearError(inputNome.closest('.form-group'));
    }

    // WhatsApp
    const digitsWa = inputWhatsapp ? inputWhatsapp.value.replace(/\D/g, '') : '';
    if (!digitsWa || digitsWa.length < 10) {
      showError(inputWhatsapp.closest('.form-group'), 'Informe seu número de WhatsApp com DDD.');
      isValid = false;
    } else {
      clearError(inputWhatsapp.closest('.form-group'));
    }

    // Faixa de valor
    if (!selectFaixaValor || !selectFaixaValor.value) {
      showError(selectFaixaValor.closest('.form-group'), 'Selecione a faixa de valor desejada.');
      isValid = false;
    } else {
      clearError(selectFaixaValor.closest('.form-group'));
    }

    // Restrição
    if (!selectRestricao || !selectRestricao.value) {
      showError(selectRestricao.closest('.form-group'), 'Informe sua situação para orientarmos o melhor plano.');
      isValid = false;
    } else {
      clearError(selectRestricao.closest('.form-group'));
    }

    // CPF (se preenchido deve ter 11 dígitos)
    const digitsCpf = inputCpf ? inputCpf.value.replace(/\D/g, '') : '';
    if (digitsCpf.length > 0 && digitsCpf.length < 11) {
      showError(inputCpf.closest('.form-group'), 'Digite um CPF válido ou deixe o campo em branco.');
      isValid = false;
    } else {
      clearError(inputCpf.closest('.form-group'));
    }

    // Consentimento
    if (!checkboxConsent || !checkboxConsent.checked) {
      showError(checkboxConsent.closest('.form-group'), 'É necessário autorizar o contato para agendar.');
      isValid = false;
    } else {
      clearError(checkboxConsent.closest('.form-group'));
    }

    return isValid;
  };

  /* --------------------------------------------------------------------------
     7. Envio do Formulário -> Sheets + WhatsApp + DataLayer
     -------------------------------------------------------------------------- */
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm()) {
        const firstErr = form.querySelector('.has-error input, .has-error select');
        if (firstErr) firstErr.focus();
        return;
      }

      const submitBtn = document.getElementById('btn-submit-lead');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="pulse-dot"></span> Enviando e abrindo WhatsApp...';
      }

      const nome = inputNome.value.trim();
      const whatsapp = inputWhatsapp.value.trim();
      const faixaValor = selectFaixaValor.value;
      const restricao = selectRestricao.value;
      const cpf = inputCpf ? inputCpf.value.trim() : '';
      const produtoInteresse = inputProdutoInteresse ? inputProdutoInteresse.value.trim() : currentModel;

      // Mensagem humanizada para o WhatsApp da Loja
      const message = `Olá equipe Gordinho Celulares! 👋\n\n` +
        `Gostaria de agendar minha análise presencial para comprar um celular no *Boleto Bancário* (em até 18x):\n\n` +
        `👤 *Nome:* ${nome}\n` +
        `📱 *WhatsApp:* ${whatsapp}\n` +
        `📲 *Aparelho de Interesse:* ${produtoInteresse || 'Não definido'}\n` +
        `💰 *Faixa de Valor:* ${faixaValor}\n` +
        `🧾 *Possui Restrição no Nome:* ${restricao}\n` +
        (cpf ? `🆔 *CPF:* ${cpf}\n` : '') +
        (utmCampaign ? `🎯 *Origem do Anúncio:* ${utmSource} / ${utmCampaign}\n` : '') +
        `\nPodem me informar os horários disponíveis para eu ir até a loja na Av. Noroeste?`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodedMessage}`;

      // Disparo de Eventos no Google Ads / GTM / Meta Pixel
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'lead_boleto_enviado',
          event_category: 'Conversao_Google_Ads',
          event_label: produtoInteresse,
          nome,
          whatsapp,
          faixa_valor: faixaValor,
          restricao,
          utm_source: utmSource,
          utm_campaign: utmCampaign,
          gclid: gclid
        });
      }

      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name: produtoInteresse,
          content_category: 'Celular no Boleto',
          value: currentPrice,
          currency: 'BRL'
        });
      }

      let redirected = false;
      const redirectToWhatsApp = () => {
        if (redirected) return;
        redirected = true;
        window.location.href = whatsappUrl;
      };

      // Dispara envio para a planilha do Google Sheets via query string
      const formData = new URLSearchParams({
        nome,
        whatsapp,
        faixa_valor: faixaValor,
        compra_boleto: 'Sim',
        restricao: restricao,
        produto_interesse: produtoInteresse,
        cpf,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        gclid: gclid
      });

      fetch(`${GOOGLE_SHEETS_URL}?${formData.toString()}`, {
        method: 'POST',
        mode: 'no-cors'
      })
      .catch(err => console.warn('Aviso: envio Sheets completado via fallback:', err))
      .finally(redirectToWhatsApp);

      // Fallback seguro caso o fetch demore mais de 1.8 segundos
      setTimeout(redirectToWhatsApp, 1800);
    });
  }

  /* --------------------------------------------------------------------------
     8. FAQ Acordeão com Acessibilidade ARIA
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item, index) => {
    const btn = item.querySelector('.faq-question-btn');
    const ans = item.querySelector('.faq-answer');

    // Abre o primeiro item por padrão
    if (index === 0 && ans) {
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      ans.style.maxHeight = ans.scrollHeight + 40 + 'px';
    }

    if (btn && ans) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Fecha outros itens
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question-btn');
            const otherAns = other.querySelector('.faq-answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAns) otherAns.style.maxHeight = null;
          }
        });

        if (isActive) {
          item.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          ans.style.maxHeight = null;
        } else {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          ans.style.maxHeight = ans.scrollHeight + 40 + 'px';
        }
      });
    }
  });

  /* --------------------------------------------------------------------------
     9. Modal de Políticas e Termos de Financiamento
     -------------------------------------------------------------------------- */
  const policyModal = document.getElementById('policy-modal');
  const policyTitle = document.getElementById('policy-modal-title');
  const policyBody = document.getElementById('policy-modal-body');
  const policyCloseBtn = document.getElementById('policy-close-btn');

  const policiesContent = {
    privacidade: {
      title: 'Política de Privacidade e Proteção de Dados',
      html: `
        <p>A <strong>Gordinho Celulares</strong> valoriza sua privacidade e está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).</p>
        <h4>1. Finalidade da Coleta</h4>
        <p>Os dados pessoais fornecidos nos formulários de pré-cadastro (Nome, WhatsApp, CPF opcional e interesse de compra) são utilizados exclusivamente para entrar em contato via WhatsApp e agendar sua consulta presencial de crédito em nossa loja física.</p>
        <h4>2. Compartilhamento</h4>
        <p>Seus dados não são vendidos nem transferidos a terceiros não autorizados. Apenas as instituições financeiras parceiras devidamente homologadas recebem os dados cadastrais necessários durante o atendimento presencial para a efetivação da consulta de crédito.</p>
        <h4>3. Seus Direitos</h4>
        <p>Você pode solicitar a qualquer momento a confirmação de existência de tratamento, a alteração ou a exclusão definitiva de seus dados pelo nosso WhatsApp oficial (67) 99245-1418.</p>
      `
    },
    termos: {
      title: 'Termos de Financiamento no Boleto Bancário',
      html: `
        <p>O parcelamento em até 18x no boleto bancário é viabilizado através de correspondente bancário devidamente credenciado e instituições financeiras parceiras regulamentadas pelo Banco Central do Brasil.</p>
        <h4>1. Análise Presencial</h4>
        <p>A análise e aprovação de crédito são realizadas de forma presencial em nossa loja física na <strong>Avenida Noroeste, 5338, Centro, Campo Grande – MS</strong>. O envio do pré-cadastro online não garante aprovação imediata nem constitui contrato de financiamento.</p>
        <h4>2. Condições e Prazos</h4>
        <p>O parcelamento pode ser contratado em prazos que variam de 3 a 18 meses. O Custo Efetivo Total (CET), eventuais taxas de juros, valor de entrada e limite aprovado são definidos exclusivamente pela política de crédito da instituição financeira no momento da consulta presencial do CPF.</p>
        <h4>3. Documentação</h4>
        <p>Para a formalização na loja é indispensável a apresentação de documento oficial de identificação com foto (RG ou CNH original) válido em território nacional.</p>
      `
    },
    negativados: {
      title: 'Condições Especiais para Pessoas com Restrição no Nome',
      html: `
        <p>A <strong>Gordinho Celulares</strong> trabalha com parceiros financeiros especializados em modelos Android que utilizam motores de crédito com critérios ampliados além do score convencional do SPC/Serasa.</p>
        <h4>1. Critérios Flexíveis</h4>
        <p>Mesmo com restrições financeiras ativas ou score reduzido, o cliente pode ter crédito aprovado conforme seu perfil cadastral e capacidade de pagamento avaliada na loja.</p>
        <h4>2. Possibilidade de Entrada</h4>
        <p>Em alguns casos de restrição mais acentuada, a instituição parceira pode solicitar uma entrada facilitada para liberação do saldo restante no boleto.</p>
      `
    }
  };

  const openPolicyModal = (policyKey) => {
    const data = policiesContent[policyKey];
    if (data && policyModal) {
      if (policyTitle) policyTitle.textContent = data.title;
      if (policyBody) policyBody.innerHTML = data.html;
      policyModal.classList.add('active');
    }
  };

  const closePolicyModal = () => {
    if (policyModal) policyModal.classList.remove('active');
  };

  document.querySelectorAll('.open-policy-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const policyKey = btn.getAttribute('data-policy');
      openPolicyModal(policyKey);
    });
  });

  if (policyCloseBtn) policyCloseBtn.addEventListener('click', closePolicyModal);
  if (policyModal) {
    policyModal.addEventListener('click', (e) => {
      if (e.target === policyModal) closePolicyModal();
    });
  }

  // Tecla ESC fecha modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && policyModal && policyModal.classList.contains('active')) {
      closePolicyModal();
    }
  });

  // Track de cliques gerais para WhatsApp
  document.querySelectorAll('a[href*="wa.me"], .btn-whatsapp').forEach(waLink => {
    waLink.addEventListener('click', () => {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'whatsapp_click',
          link_text: waLink.innerText || 'WhatsApp CTA'
        });
      }
    });
  });
});
