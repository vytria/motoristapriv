// script.js - Lógica da calculadora e funcionalidades
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const origemInput = document.getElementById('origem');
    const destinoInput = document.getElementById('destino');
    const tipoServicoSelect = document.getElementById('tipo-servico');
    const mensalOptions = document.getElementById('mensal-options');
    const calcularBtn = document.getElementById('calcular-btn');
    const limparBtn = document.getElementById('limpar-btn');
    const sugestoesOrigem = document.getElementById('sugestoes-origem');
    const sugestoesDestino = document.getElementById('sugestoes-destino');
    
    // Elementos de resultado
    const resultadoDistancia = document.getElementById('resultado-distancia');
    const resultadoTempo = document.getElementById('resultado-tempo');
    const resultadoValorBase = document.getElementById('resultado-valor-base');
    const resultadoMensal = document.getElementById('resultado-mensal');
    const resultadoTotal = document.getElementById('valor-total');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    // Preço por km
    const PRECO_POR_KM = 2.00;
    
    // Configurar sugestões de endereço
    origemInput.addEventListener('input', function() {
        filtrarSugestoes(this.value, sugestoesOrigem);
    });
    
    destinoInput.addEventListener('input', function() {
        filtrarSugestoes(this.value, sugestoesDestino);
    });
    
    // Mostrar/ocultar opções mensais
    tipoServicoSelect.addEventListener('change', function() {
        if (this.value === 'mensal') {
            mensalOptions.style.display = 'block';
            resultadoMensal.style.display = 'flex';
        } else {
            mensalOptions.style.display = 'none';
            resultadoMensal.style.display = 'none';
        }
    });
    
    // Função para filtrar sugestões
    function filtrarSugestoes(valor, container) {
        if (!valor || valor.length < 2) {
            container.style.display = 'none';
            return;
        }
        
        const termo = valor.toLowerCase();
        const sugestoesFiltradas = ruasLages.filter(rua => 
            rua.toLowerCase().includes(termo)
        ).slice(0, 8);
        
        if (sugestoesFiltradas.length > 0) {
            container.innerHTML = sugestoesFiltradas.map(rua => 
                `<div class="sugestoes-item" data-rua="${rua}">${rua}</div>`
            ).join('');
            container.style.display = 'block';
            
            // Adicionar evento de clique nas sugestões
            container.querySelectorAll('.sugestoes-item').forEach(item => {
                item.addEventListener('click', function() {
                    const input = container.id === 'sugestoes-origem' ? origemInput : destinoInput;
                    input.value = this.getAttribute('data-rua');
                    container.style.display = 'none';
                });
            });
        } else {
            container.style.display = 'none';
        }
    }
    
    // Fechar sugestões ao clicar fora
    document.addEventListener('click', function(e) {
        if (!origemInput.contains(e.target) && !sugestoesOrigem.contains(e.target)) {
            sugestoesOrigem.style.display = 'none';
        }
        if (!destinoInput.contains(e.target) && !sugestoesDestino.contains(e.target)) {
            sugestoesDestino.style.display = 'none';
        }
    });
    
    // Limpar formulário
    limparBtn.addEventListener('click', function() {
        origemInput.value = '';
        destinoInput.value = '';
        tipoServicoSelect.value = 'avulso';
        mensalOptions.style.display = 'none';
        
        resultadoDistancia.innerHTML = '<span>Distância:</span><span class="valor">--</span>';
        resultadoTempo.innerHTML = '<span>Tempo estimado:</span><span class="valor">--</span>';
        resultadoValorBase.innerHTML = '<span>Valor por corrida:</span><span class="valor">--</span>';
        resultadoMensal.innerHTML = '<span>Corridas no mês:</span><span class="valor">--</span>';
        resultadoTotal.textContent = 'R$ 0,00';
        
        sugestoesOrigem.style.display = 'none';
        sugestoesDestino.style.display = 'none';
        resultadoMensal.style.display = 'none';
    });
    
    // Calcular orçamento
    calcularBtn.addEventListener('click', async function() {
        // Validar entrada
        if (!origemInput.value.trim() || !destinoInput.value.trim()) {
            alert('Por favor, informe origem e destino');
            return;
        }
        
        if (origemInput.value.trim().toLowerCase() === destinoInput.value.trim().toLowerCase()) {
            alert('Origem e destino não podem ser iguais');
            return;
        }
        
        // Mostrar loading
        calcularBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculando...';
        calcularBtn.disabled = true;
        
        try {
            // Calcular distância
            const distancia = await calcularDistanciaOSRM(
                origemInput.value.trim(), 
                destinoInput.value.trim()
            );
            
            // Calcular tempo estimado (considerando 30km/h média em cidade)
            const tempoMinutos = Math.round((distancia / 30) * 60);
            
            // Calcular valores
            const valorPorCorrida = distancia * PRECO_POR_KM;
            
            let corridasNoMes = 0;
            let valorTotal = valorPorCorrida;
            
            if (tipoServicoSelect.value === 'mensal') {
                const diasPorSemana = parseInt(document.getElementById('dias-semana').value) || 5;
                const semanasNoMes = parseInt(document.getElementById('semanas-mes').value) || 4;
                corridasNoMes = diasPorSemana * semanasNoMes;
                valorTotal = valorPorCorrida * corridasNoMes;
            }
            
            // Atualizar resultados
            resultadoDistancia.innerHTML = `<span>Distância:</span><span class="valor">${distancia.toFixed(1)} km</span>`;
            
            resultadoTempo.innerHTML = `<span>Tempo estimado:</span><span class="valor">${tempoMinutos} min</span>`;
            
            resultadoValorBase.innerHTML = `<span>Valor por corrida:</span><span class="valor">R$ ${valorPorCorrida.toFixed(2)}</span>`;
            
            if (tipoServicoSelect.value === 'mensal') {
                resultadoMensal.innerHTML = `<span>Corridas no mês:</span><span class="valor">${corridasNoMes}</span>`;
            }
            
            resultadoTotal.textContent = `R$ ${valorTotal.toFixed(2)}`;
            
            // Atualizar link do WhatsApp
            const mensagem = `Olá João! Gostaria de orçar uma corrida:\n` +
                            `Origem: ${origemInput.value}\n` +
                            `Destino: ${destinoInput.value}\n` +
                            `Distância: ${distancia.toFixed(1)} km\n` +
                            `Valor: R$ ${valorTotal.toFixed(2)} ${tipoServicoSelect.value === 'mensal' ? '(Plano Mensal)' : '(Avulso)'}`;
            
            whatsappBtn.href = `https://wa.me/5549984094010?text=${encodeURIComponent(mensagem)}`;
            
        } catch (error) {
            console.error('Erro ao calcular:', error);
            
            // Fallback: usar cálculo aproximado
            const distanciaAproximada = calcularDistanciaAproximada(
                origemInput.value.trim(),
                destinoInput.value.trim()
            );
            
            if (distanciaAproximada) {
                // Recalcular com distância aproximada
                const valorPorCorrida = distanciaAproximada * PRECO_POR_KM;
                const tempoMinutos = Math.round((distanciaAproximada / 30) * 60);
                
                let corridasNoMes = 0;
                let valorTotal = valorPorCorrida;
                
                if (tipoServicoSelect.value === 'mensal') {
                    const diasPorSemana = parseInt(document.getElementById('dias-semana').value) || 5;
                    const semanasNoMes = parseInt(document.getElementById('semanas-mes').value) || 4;
                    corridasNoMes = diasPorSemana * semanasNoMes;
                    valorTotal = valorPorCorrida * corridasNoMes;
                }
                
                resultadoDistancia.innerHTML = `<span>Distância (aproximada):</span><span class="valor">${distanciaAproximada} km</span>`;
                resultadoTempo.innerHTML = `<span>Tempo estimado:</span><span class="valor">${tempoMinutos} min</span>`;
                resultadoValorBase.innerHTML = `<span>Valor por corrida:</span><span class="valor">R$ ${valorPorCorrida.toFixed(2)}</span>`;
                
                if (tipoServicoSelect.value === 'mensal') {
                    resultadoMensal.innerHTML = `<span>Corridas no mês:</span><span class="valor">${corridasNoMes}</span>`;
                }
                
                resultadoTotal.textContent = `R$ ${valorTotal.toFixed(2)}`;
                
                // Atualizar link do WhatsApp
                const mensagem = `Olá João! Gostaria de orçar uma corrida:\n` +
                                `Origem: ${origemInput.value}\n` +
                                `Destino: ${destinoInput.value}\n` +
                                `Distância aproximada: ${distanciaAproximada} km\n` +
                                `Valor: R$ ${valorTotal.toFixed(2)} ${tipoServicoSelect.value === 'mensal' ? '(Plano Mensal)' : '(Avulso)'}`;
                
                whatsappBtn.href = `https://wa.me/5549984094010?text=${encodeURIComponent(mensagem)}`;
            } else {
                alert('Não foi possível calcular a distância. Por favor, verifique os endereços ou entre em contato diretamente.');
            }
        } finally {
            // Restaurar botão
            calcularBtn.innerHTML = '<i class="fas fa-calculator"></i> Calcular Orçamento';
            calcularBtn.disabled = false;
        }
    });
    
    // Função para calcular distância usando OSRM (gratuito)
    async function calcularDistanciaOSRM(origem, destino) {
        // Primeiro, tentamos obter coordenadas aproximadas
        const coordsOrigem = await obterCoordenadasAproximadas(origem);
        const coordsDestino = await obterCoordenadasAproximadas(destino);
        
        // Se não conseguimos coordenadas, lançar erro
        if (!coordsOrigem || !coordsDestino) {
            throw new Error('Não foi possível obter coordenadas para os endereços');
        }
        
        // Chamar API OSRM
        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/` +
            `${coordsOrigem.lon},${coordsOrigem.lat};` +
            `${coordsDestino.lon},${coordsDestino.lat}?overview=false`
        );
        
        if (!response.ok) {
            throw new Error('Erro ao calcular rota');
        }
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            // Distância em km (API retorna em metros)
            const distanciaMetros = data.routes[0].distance;
            const distanciaKm = distanciaMetros / 1000;
            
            return distanciaKm;
        } else {
            throw new Error('Rota não encontrada');
        }
    }
    
    // Função para obter coordenadas aproximadas baseadas no nome da rua/bairro
    async function obterCoordenadasAproximadas(local) {
        // Coordenadas centrais de Lages
        const centroLages = {
            lat: -27.8153,
            lon: -50.3259
        };
        
        // Mapeamento aproximado de bairros/regiões
        const regioes = {
            'centro': {lat: -27.8160, lon: -50.3265},
            'conta dinheiro': {lat: -27.8100, lon: -50.3200},
            'habitação': {lat: -27.8300, lon: -50.3400},
            'são francisco': {lat: -27.8050, lon: -50.3300},
            'santa clara': {lat: -27.8400, lon: -50.3200},
            'copacabana': {lat: -27.8000, lon: -50.3500},
            'gethal': {lat: -27.8200, lon: -50.3000},
            'caroba': {lat: -27.8500, lon: -50.3100}
        };
        
        const localLower = local.toLowerCase();
        
        // Verificar se é uma região conhecida
        for (const [regiao, coords] of Object.entries(regioes)) {
            if (localLower.includes(regiao)) {
                return coords;
            }
        }
        
        // Se não encontrou, retorna centro de Lages com pequena variação
        // para evitar cálculo de distância zero
        const variacao = Math.random() * 0.01; // Pequena variação de ~1km
        return {
            lat: centroLages.lat + (Math.random() > 0.5 ? variacao : -variacao),
            lon: centroLages.lon + (Math.random() > 0.5 ? variacao : -variacao)
        };
    }
    
    // Função de fallback: cálculo aproximado baseado em bairros
    function calcularDistanciaAproximada(origem, destino) {
        const origemLower = origem.toLowerCase();
        const destinoLower = destino.toLowerCase();
        
        // Extrair bairro da origem
        let bairroOrigem = 'centro';
        for (const bairro of Object.keys(distanciasBairros)) {
            const bairroNome = bairro.split('-')[0].toLowerCase();
            if (origemLower.includes(bairroNome)) {
                bairroOrigem = bairroNome;
                break;
            }
        }
        
        // Extrair bairro do destino
        let bairroDestino = 'centro';
        for (const bairro of Object.keys(distanciasBairros)) {
            const bairroNome = bairro.split('-')[1].toLowerCase();
            if (destinoLower.includes(bairroNome)) {
                bairroDestino = bairroNome;
                break;
            }
        }
        
        // Verificar se temos distância direta
        const chaveDireta = `${bairroOrigem}-${bairroDestino}`;
        const chaveInversa = `${bairroDestino}-${bairroOrigem}`;
        
        if (distanciasBairros[chaveDireta]) {
            return distanciasBairros[chaveDireta];
        } else if (distanciasBairros[chaveInversa]) {
            return distanciasBairros[chaveInversa];
        } else {
            // Distância padrão para bairros não mapeados
            return 4.0; // 4km como média
        }
    }
    
    // Inicialização
    function init() {
        // Configurar valores padrão
        document.getElementById('dias-semana').value = 5;
        document.getElementById('semanas-mes').value = 4;
        
        // Adicionar evento para calcular ao pressionar Enter
        origemInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calcularBtn.click();
        });
        
        destinoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calcularBtn.click();
        });
        
        console.log('Sistema João Motorista Particular inicializado!');
    }
    
    init();
});
