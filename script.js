/**
 * GORDINHO CELULARES - LANDING PAGE INTERACTIVE ENGINE
 * Features:
 * - Alternância Dinâmica de Tema (Claro / Escuro) com Persistência em LocalStorage
 * - Sanitização e Máscara Inteligente de Telefone/WhatsApp (XX) XXXXX-XXXX
 * - Validação e Redirecionamento Imediato para o WhatsApp (Anti-Popup Blocker)
 * - Auto-preenchimento de modelos a partir dos Cards da Vitrine
 * - Accordion Dinâmico do FAQ com transição suave
 * - Scroll Reveal via IntersectionObserver
 * - Sticky Mobile CTA Bar & Header Scroll Glow
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constantes da Loja
  const STORE_WHATSAPP_NUMBER = '5567992451418'; // (67) 99245-1418
  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyXFuEbKpKCLGWKCsW2Gg369w7UwKl3PQDomJIwjtYDnv2YeKiVp9p-rJ65vS676i7x/exec';

  // Elementos do DOM
  const navbar = document.getElementById('navbar');
  const form = document.getElementById('form-simulador');
  const inputNome = document.getElementById('lead-nome');
  const inputWhatsapp = document.getElementById('lead-whatsapp');
  const selectFaixaValor = document.getElementById('lead-faixa-valor');
  const selectBoleto = document.getElementById('lead-boleto');
  const inputCpf = document.getElementById('lead-cpf');
  const checkboxConsent = document.getElementById('lead-consent');
  const inputProdutoInteresse = document.getElementById('lead-produto-interesse');
  const mobileStickyCta = document.getElementById('mobile-sticky-cta');
  const tooltipClose = document.getElementById('close-tooltip');
  const waTooltip = document.getElementById('wa-tooltip');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const metaThemeColor = document.getElementById('meta-theme-color');

  /* --------------------------------------------------------------------------
     1. Motor de Tema Claro / Escuro (Theme Switcher)
     -------------------------------------------------------------------------- */
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('gordinho_theme', theme);
    } catch (e) {
      console.warn('LocalStorage inacessível:', e);
    }

    // Atualiza a meta tag de cor da barra do navegador mobile
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'light' ? '#f8fafc' : '#09090b');
    }
  };

  // Detecta tema salvo ou preferência do sistema
  const initTheme = () => {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem('gordinho_theme');
    } catch (e) {}

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Se não há preferência salva, padrão é 'dark' (identidade da marca tech)
      setTheme('dark');
    }
  };

  initTheme();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);

      // Micro-animação tátil de clique
      themeToggleBtn.style.transform = 'scale(0.92)';
      setTimeout(() => {
        themeToggleBtn.style.transform = '';
      }, 150);
    });
  }

  /* --------------------------------------------------------------------------
     2. Header e Sticky CTA ao Rolar a Página
     -------------------------------------------------------------------------- */
  const handleScroll = () => {
    const scrollPos = window.scrollY;

    // Header styling on scroll
    if (navbar) {
      if (scrollPos > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Mobile Sticky CTA aparece após 350px de rolagem
    if (mobileStickyCta) {
      if (scrollPos > 350) {
        mobileStickyCta.classList.add('visible');
      } else {
        mobileStickyCta.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* --------------------------------------------------------------------------
     3. Fechar Tooltip do WhatsApp
     -------------------------------------------------------------------------- */
  if (tooltipClose && waTooltip) {
    tooltipClose.addEventListener('click', (e) => {
      e.stopPropagation();
      waTooltip.style.display = 'none';
    });
  }

  /* --------------------------------------------------------------------------
     4. Máscara de Telefone Inteligente (com tratamento de +55 colado)
     -------------------------------------------------------------------------- */
  const applyPhoneMask = (value) => {
    let digits = value.replace(/\D/g, '');

    // Se o usuário colou com código do país (ex: 5567992451418), remove o 55
    if (digits.startsWith('55') && digits.length >= 12) {
      digits = digits.substring(2);
    }

    // Limita a 11 dígitos
    if (digits.length > 11) {
      digits = digits.substring(0, 11);
    }

    // Formata
    if (digits.length <= 2) {
      return digits.length > 0 ? `(${digits}` : '';
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
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

    inputWhatsapp.addEventListener('blur', () => {
      const digits = inputWhatsapp.value.replace(/\D/g, '');
      if (digits.length > 0 && digits.length < 10) {
        showError(inputWhatsapp.closest('.form-group'), 'Digite seu WhatsApp completo com DDD.');
      }
    });
  }

  /* --------------------------------------------------------------------------
     5. Validação e Feedback do Formulário
     -------------------------------------------------------------------------- */
  const showError = (formGroup, customMessage = null) => {
    if (!formGroup) return;
    formGroup.classList.add('has-error');
    if (customMessage) {
      const errorSpan = formGroup.querySelector('.error-msg');
      if (errorSpan) errorSpan.textContent = customMessage;
    }
  };

  const clearError = (formGroup) => {
    if (!formGroup) return;
    formGroup.classList.remove('has-error');
  };

  if (inputNome) {
    inputNome.addEventListener('input', () => clearError(inputNome.closest('.form-group')));
  }
  if (selectFaixaValor) {
    selectFaixaValor.addEventListener('change', () => clearError(selectFaixaValor.closest('.form-group')));
  }
  if (selectBoleto) {
    selectBoleto.addEventListener('change', () => clearError(selectBoleto.closest('.form-group')));
  }
  if (inputCpf) {
    inputCpf.addEventListener('input', (e) => {
      e.target.value = applyCpfMask(e.target.value);
      clearError(inputCpf.closest('.form-group'));
    });
  }
  if (checkboxConsent) {
    checkboxConsent.addEventListener('change', () => clearError(checkboxConsent.closest('.form-group')));
  }

  const validateForm = () => {
    let isValid = true;

    // 1. Nome
    const nomeVal = inputNome ? inputNome.value.trim() : '';
    if (!nomeVal || nomeVal.length < 3) {
      showError(inputNome.closest('.form-group'), 'Informe seu nome completo (ao menos 3 letras).');
      isValid = false;
    } else {
      clearError(inputNome.closest('.form-group'));
    }

    // 2. WhatsApp
    const digitsWa = inputWhatsapp ? inputWhatsapp.value.replace(/\D/g, '') : '';
    if (!digitsWa || digitsWa.length < 10) {
      showError(inputWhatsapp.closest('.form-group'), 'Digite um número de WhatsApp válido com DDD.');
      isValid = false;
    } else {
      clearError(inputWhatsapp.closest('.form-group'));
    }

    // 3. Faixa de Valor
    if (!selectFaixaValor || !selectFaixaValor.value) {
      showError(selectFaixaValor.closest('.form-group'), 'Selecione a faixa de valor desejada.');
      isValid = false;
    } else {
      clearError(selectFaixaValor.closest('.form-group'));
    }

    // 4. Compra no Boleto
    if (!selectBoleto || !selectBoleto.value) {
      showError(selectBoleto.closest('.form-group'), 'Selecione uma opção.');
      isValid = false;
    } else {
      clearError(selectBoleto.closest('.form-group'));
    }

    // 5. CPF (opcional, mas se preenchido precisa ter 11 dígitos)
    const digitsCpf = inputCpf ? inputCpf.value.replace(/\D/g, '') : '';
    if (digitsCpf.length > 0 && digitsCpf.length < 11) {
      showError(inputCpf.closest('.form-group'), 'Digite um CPF válido ou deixe em branco.');
      isValid = false;
    } else {
      clearError(inputCpf.closest('.form-group'));
    }

    // 6. Consentimento
    if (!checkboxConsent || !checkboxConsent.checked) {
      showError(checkboxConsent.closest('.form-group'), 'É necessário autorizar o contato para continuar.');
      isValid = false;
    } else {
      clearError(checkboxConsent.closest('.form-group'));
    }

    return isValid;
  };

  /* --------------------------------------------------------------------------
     6. Envio do Formulário -> WhatsApp da Loja
     -------------------------------------------------------------------------- */
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm()) {
        const firstError = form.querySelector('.has-error .form-input');
        if (firstError) firstError.focus();
        return;
      }

      const nome = inputNome.value.trim();
      const whatsapp = inputWhatsapp.value.trim();
      const faixaValor = selectFaixaValor.value;
      const boleto = selectBoleto.value;
      const cpf = inputCpf ? inputCpf.value.trim() : '';
      const produtoInteresse = inputProdutoInteresse ? inputProdutoInteresse.value.trim() : '';

      const message = `Olá equipe da Gordinho Celulares! 👋\n\n` +
        `Fiz meu pré-cadastro no site e gostaria de agendar minha análise presencial para o parcelamento no *Boleto Bancário*:\n\n` +
        `👤 *Nome:* ${nome}\n` +
        `📱 *WhatsApp:* ${whatsapp}\n` +
        `💰 *Faixa de Valor:* ${faixaValor}\n` +
        `🧾 *Pretende comprar no boleto?* ${boleto}\n` +
        (cpf ? `🆔 *CPF:* ${cpf}\n` : '') +
        (produtoInteresse ? `📲 *Produto de Interesse:* ${produtoInteresse}\n` : '') +
        `\nGostaria de agendar um horário para ir até a loja e concluir minha análise presencial.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodedMessage}`;

      let redirected = false;
      const redirectToWhatsapp = () => {
        if (redirected) return;
        redirected = true;
        window.location.href = whatsappUrl;
      };

      const formData = new URLSearchParams({
        nome,
        whatsapp,
        faixa_valor: faixaValor,
        compra_boleto: boleto,
        cpf,
      });

      // Os dados vão na query string (e não no body) porque o endpoint /exec do
      // Apps Script redireciona (302) antes de executar o script, e esse
      // redirecionamento derruba o body do POST — a query string sobrevive.
      fetch(`${GOOGLE_SHEETS_URL}?${formData.toString()}`, {
        method: 'POST',
        mode: 'no-cors',
      })
        .catch((err) => console.warn('Erro ao enviar dados para o Google Sheets:', err))
        .finally(redirectToWhatsapp);

      setTimeout(redirectToWhatsapp, 2000);
    });
  }

  /* --------------------------------------------------------------------------
     7. Interação dos Cards de Produtos: Seleção e Scroll Suave
     -------------------------------------------------------------------------- */
  const selectModelAndScroll = (modelName) => {
    if (inputProdutoInteresse) {
      inputProdutoInteresse.value = modelName;
    }

    const simuladorSection = document.getElementById('simulador');
    if (simuladorSection) {
      simuladorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        const card = simuladorSection.querySelector('.simulation-card');
        if (card) {
          card.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
          card.style.borderColor = 'var(--emerald-500)';
          card.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.45)';
          if (inputNome) inputNome.focus();

          setTimeout(() => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
          }, 1600);
        }
      }, 600);
    }
  };

  document.querySelectorAll('.btn-select-model').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const modelName = button.getAttribute('data-model');
      if (modelName) {
        selectModelAndScroll(modelName);
      }
    });
  });

  /* --------------------------------------------------------------------------
     8. Accordion Dinâmico do FAQ
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item, index) => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (index === 0) {
      item.classList.add('active');
      questionBtn.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
    }

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question');
          const otherAns = otherItem.querySelector('.faq-answer');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
      }
    });
  });

  /* --------------------------------------------------------------------------
     9. Scroll Reveal Animations
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }
});
