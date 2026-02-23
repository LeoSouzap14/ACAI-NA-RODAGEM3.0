document.addEventListener("DOMContentLoaded", () => {
  /* ===== CONFIG ===== */
  const WHATSAPP_LOJA = "54996058595";
  const TEMPO_ENTREGA = "30 a 45 minutos";
  const CHAVE_PIX = "54996058595";
  const NOME_PIX = "ACAI NA RODAGEM";
  const CIDADE_PIX = "Caxias do Sul";

  /* ===== ELEMENTOS ===== */
  const modal = document.getElementById("modal");
  const bairroSelect = document.getElementById("bairro");
  const pagamentos = document.querySelectorAll('input[name="pagamento"]');
  const nomeCliente = document.getElementById("nomeCliente");
  const telefoneCliente = document.getElementById("telefoneCliente");
  const pixArea = document.getElementById("pixArea");
  const tipoCartaoDiv = document.getElementById("tipoCartao");

  let carrinho = [];
  let entrega = 0;

  const bairrosEntrega = {
    "Serrano": 8, "Iracema": 6, "Aldorado": 8, "Ana Rech": 12, "Santa Barbará": 18,
    "Castelo": 8, "São Cristovão": 8, "Marianinha": 8, "Jardim das Hortências": 12,
    "Vila Seca": 30, "Fazenda Souza": 22.5, "Parque Oásis": 18, "Filomena": 8,
    "Santo Antônio": 8, "Parada Cristal": 18, "São Ciro": 15, "Diamantino": 18, "De lazer": 18
  };

  /* ===== NOVA FUNÇÃO: COPIAR PIX ===== */
  window.copiarPix = () => {
    const chave = CHAVE_PIX;
    const btn = document.getElementById('btnCopiar');
    
    navigator.clipboard.writeText(chave).then(() => {
      btn.innerText = "✅ Chave Copiada!";
      btn.style.background = "#9cff00";
      btn.style.color = "#000";
      
      setTimeout(() => {
        btn.innerText = "📋 Copiar Chave PIX";
        btn.style.background = "#ffffff";
      }, 3000);
    });
  };

  /* ===== CONTROLE DE LIMITES E RESET ===== */
  const gerenciarLimites = () => {
    const radioTamanho = document.querySelector('input[name="tamanho"]:checked');
    if (!radioTamanho) return;
    
    const limite = parseInt(radioTamanho.getAttribute('data-limite'));
    const gratuitos = document.querySelectorAll('.adicional[value="0"]');
    const selecionados = document.querySelectorAll('.adicional[value="0"]:checked');

    gratuitos.forEach(cb => {
      if (selecionados.length >= limite && !cb.checked) {
        cb.disabled = true;
      } else {
        cb.disabled = false;
      }
    });

    const label = document.getElementById("labelGratuitos");
    if (label) label.innerText = `Adicionais Gratuitos (${selecionados.length}/${limite})`;
  };

  window.abrirModal = () => {
    modal.classList.remove("hidden");
    document.querySelectorAll(".adicional").forEach(input => {
      input.checked = false;
      input.disabled = false;
    });
    const primeiroTamanho = document.querySelector('input[name="tamanho"]');
    if (primeiroTamanho) primeiroTamanho.checked = true;
    gerenciarLimites();
  };

  document.querySelectorAll('input[name="tamanho"]').forEach(r => {
    r.addEventListener('change', () => {
      document.querySelectorAll('.adicional[value="0"]').forEach(a => a.checked = false);
      gerenciarLimites();
    });
  });

  document.querySelectorAll('.adicional[value="0"]').forEach(c => {
    c.addEventListener('change', gerenciarLimites);
  });

  /* ===== NAVEGAÇÃO COM BARRA DE PROGRESSO ===== */
  window.mostrarTela = (id) => {
    const telas = ["cardapio", "dadosPedido", "carrinho", "entrega"];
    telas.forEach(t => {
      const el = document.getElementById(t);
      if (el) el.classList.add("hidden");
    });

    const bar = document.getElementById('progressBar');
    if (bar) {
      if(id === 'cardapio') bar.style.width = '25%';
      if(id === 'carrinho') bar.style.width = '50%';
      if(id === 'dadosPedido') bar.style.width = '75%';
      if(id === 'entrega') bar.style.width = '100%';
    }

    const targetEl = document.getElementById(id);
    if (targetEl) targetEl.classList.remove("hidden");
    window.scrollTo(0,0);
  };

  window.fecharModal = () => modal.classList.add("hidden");

  /* ===== CARRINHO ===== */
  window.adicionarCarrinho = () => {
    const tamanhoInput = document.querySelector('input[name="tamanho"]:checked');
    if (!tamanhoInput) return alert("Selecione um tamanho!");

    const adicionaisText = [];
    let valorItem = Number(tamanhoInput.value);

    document.querySelectorAll(".adicional:checked").forEach(a => {
      adicionaisText.push(a.parentNode.querySelector('span').textContent);
      valorItem += Number(a.value);
    });

    carrinho.push({
      tamanho: tamanhoInput.parentNode.textContent.split('-')[0].trim(),
      adicionais: adicionaisText,
      valor: valorItem
    });

    atualizarCarrinho();
    window.mostrarTela("carrinho");
    window.fecharModal();
  };

  window.removerItem = (i) => {
    carrinho.splice(i, 1);
    atualizarCarrinho();
    if (carrinho.length === 0) window.mostrarTela("cardapio");
  };

  function atualizarCarrinho() {
    const lista = document.getElementById("listaCarrinho");
    if (!lista) return;
    lista.innerHTML = "";
    let somaProdutos = 0;

    carrinho.forEach((item, i) => {
      somaProdutos += item.valor;
      lista.innerHTML += `
        <div style="margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px; color: #000;">
          <p><strong>${item.tamanho}</strong> - R$ ${item.valor.toFixed(2)} 
            <button onclick="removerItem(${i})" style="color:red; background:none; width:auto; margin:0; cursor:pointer; font-size: 12px; border:none; text-transform:none;">[Remover]</button>
          </p>
          <small style="color: #555;">${item.adicionais.length ? item.adicionais.join(", ") : "Sem adicionais"}</small>
        </div>`;
    });

    document.getElementById("subtotalProdutos").innerText = somaProdutos.toFixed(2);
    document.getElementById("valorEntrega").innerText = entrega.toFixed(2);
    document.getElementById("totalFinal").innerText = (somaProdutos + entrega).toFixed(2);
    document.getElementById("totalCarrinho").innerText = (somaProdutos + entrega).toFixed(2);
    
    atualizarPix();
  }

  /* ===== PIX ATUALIZADO (VALOR E CHAVE) ===== */
  function atualizarPix() {
    const total = carrinho.reduce((s, i) => s + i.valor, 0) + entrega;
    const pixValorSpan = document.getElementById("pixValor");
    if (total > 0 && pixValorSpan) {
      pixValorSpan.innerText = total.toFixed(2);
    }
  }

  /* ===== ENTREGA E PAGAMENTO ===== */
  if (bairroSelect) {
    bairroSelect.onchange = (e) => {
      entrega = bairrosEntrega[e.target.value] || 0;
      atualizarCarrinho();
    };
  }

  pagamentos.forEach(p => p.addEventListener("change", () => {
    pixArea.classList.toggle("hidden", p.value !== "PIX");
    tipoCartaoDiv.classList.toggle("hidden", p.value !== "Cartão");
    if (p.value === "PIX") atualizarPix();
  }));

  window.confirmarPix = () => window.finalizarPedido(true);

  /* ===== FINALIZAÇÃO WHATSAPP ===== */
  window.finalizarPedido = (pixPago = false) => {
    const rua = document.getElementById("rua").value;
    const numero = document.getElementById("numero").value;

    if (!nomeCliente.value || !bairroSelect.value || !rua) {
      return alert("Por favor, preencha Nome, Bairro e Rua!");
    }

    const pagInput = document.querySelector('input[name="pagamento"]:checked');
    if (!pagInput) return alert("Escolha a forma de pagamento!");

    let pagamento = pagInput.value;
    if (pagamento === "Cartão") {
      const tipo = document.querySelector('input[name="tipoCartao"]:checked');
      if (!tipo) return alert("Selecione Crédito ou Débito!");
      pagamento += ` (${tipo.value})`;
    }
    if (pixPago) pagamento += " (PAGO VIA PIX)";

    let msg = `*AÇAÍ NA RODAGEM*\n------------------\n`;
    carrinho.forEach((item, i) => {
      msg += `*${i+1}. ${item.tamanho}*\nAdicionais: ${item.adicionais.join(", ")}\nValor: R$ ${item.valor.toFixed(2)}\n\n`;
    });

    const total = (carrinho.reduce((s, i) => s + i.valor, 0) + entrega).toFixed(2);
    const subtotal = (total - entrega).toFixed(2);

    msg += `------------------\n`;
    msg += `*Produtos:* R$ ${subtotal}\n`;
    msg += `*Entrega:* R$ ${entrega.toFixed(2)}\n`;
    msg += `*TOTAL: R$ ${total}*\n\n`;
    msg += `*CLIENTE:* ${nomeCliente.value}\n`;
    msg += `*ENDEREÇO:* ${rua}, ${numero}\n`;
    msg += `*BAIRRO:* ${bairroSelect.value}\n`;
    msg += `*PAGAMENTO:* ${pagamento}\n`;
    msg += `*TEMPO:* ${TEMPO_ENTREGA}`;

    window.open(`https://wa.me/${WHATSAPP_LOJA}?text=${encodeURIComponent(msg)}`, "_blank");
  };
});