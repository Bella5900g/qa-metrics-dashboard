/**
 * Dashboard de Métricas QA - JavaScript Principal
 * Funcionalidades para entrada de dados, cálculo de métricas e geração de relatórios
 */

class QADashboard {
    constructor() {
        this.metricas = {};
        this.charts = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupCharts();
        this.updateDateTime();
    }

    bindEvents() {
        // Botão calcular métricas
        document.getElementById('calcular-metricas').addEventListener('click', () => {
            this.calcularMetricas();
        });

        // Botão limpar dados
        document.getElementById('limpar-dados').addEventListener('click', () => {
            this.limparDados();
        });

        // Botões de geração de relatório
        document.getElementById('gerar-pdf').addEventListener('click', () => {
            this.gerarPDF();
        });

        document.getElementById('exportar-dados').addEventListener('click', () => {
            this.exportarJSON();
        });

        // Navegação suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    calcularMetricas() {
        // Coletar dados do formulário
        this.metricas = {
            taxaEscape: parseFloat(document.getElementById('taxa-escape').value) || 0,
            coberturaCodigo: parseFloat(document.getElementById('cobertura-codigo').value) || 0,
            mttr: parseFloat(document.getElementById('mttr').value) || 0,
            taxaAutomacao: parseFloat(document.getElementById('taxa-automacao').value) || 0,
            taxaAcerto: parseFloat(document.getElementById('taxa-acerto').value) || 0,
            defectsAbertos: parseInt(document.getElementById('defects-abertos').value) || 0,
            defectsFechados: parseInt(document.getElementById('defects-fechados').value) || 0,
            bugsAbertos: parseInt(document.getElementById('bugs-abertos').value) || 0,
            bugsFechados: parseInt(document.getElementById('bugs-fechados').value) || 0,
            testesCriados: parseInt(document.getElementById('testes-criados').value) || 0,
            testesExecutados: parseInt(document.getElementById('testes-executados').value) || 0,
            testesPassaram: parseInt(document.getElementById('testes-passaram').value) || 0,
            equipeResponsavel: document.getElementById('equipe-responsavel').value || 'Time QA',
            periodoAnalise: document.getElementById('periodo-analise').value || 'Últimos 30 dias',
            observacoes: document.getElementById('observacoes').value || '',
            dataGeracao: new Date().toLocaleString('pt-BR')
        };

        // Calcular métricas derivadas
        this.calcularMetricasDerivadas();

        // Atualizar dashboard
        this.atualizarDashboard();

        // Mostrar dashboard
        this.mostrarDashboard();

        // Scroll para dashboard
        document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
    }

    calcularMetricasDerivadas() {
        const { bugsAbertos, bugsFechados, defectsAbertos, defectsFechados, testesExecutados, testesPassaram } = this.metricas;
        const totalBugs = bugsAbertos + bugsFechados;
        const totalDefects = defectsAbertos + defectsFechados;

        // Taxa de correção de bugs (produção)
        this.metricas.taxaCorrecaoBugs = totalBugs > 0 ? (bugsFechados / totalBugs) * 100 : 0;

        // Taxa de correção de defects (desenvolvimento)
        this.metricas.taxaCorrecaoDefects = totalDefects > 0 ? (defectsFechados / totalDefects) * 100 : 0;

        // Taxa de sucesso dos testes
        this.metricas.taxaSucessoTestes = testesExecutados > 0 ? (testesPassaram / testesExecutados) * 100 : 0;

        // Taxa de escape baseada em bugs de produção
        this.metricas.taxaEscapeCalculada = totalDefects > 0 ? (bugsAbertos + bugsFechados) / totalDefects * 100 : 0;

        // Status geral baseado nas métricas
        this.metricas.statusGeral = this.calcularStatusGeral();

        // Pontos positivos e de atenção
        this.metricas.pontosPositivos = this.gerarPontosPositivos();
        this.metricas.pontosAtencao = this.gerarPontosAtencao();
    }

    calcularStatusGeral() {
        let score = 0;
        const metas = {
            taxaEscape: 5,
            coberturaCodigo: 70,
            mttr: 8,
            taxaAutomacao: 70,
            taxaAcerto: 85,
            taxaSucessoTestes: 90
        };

        // Taxa de Escape (menor é melhor)
        if (this.metricas.taxaEscape <= metas.taxaEscape) score += 1;

        // Cobertura de Código (maior é melhor)
        if (this.metricas.coberturaCodigo >= metas.coberturaCodigo) score += 1;

        // MTTR (menor é melhor)
        if (this.metricas.mttr <= metas.mttr) score += 1;

        // Taxa de Automação (maior é melhor)
        if (this.metricas.taxaAutomacao >= metas.taxaAutomacao) score += 1;

        // Taxa de Acerto (maior é melhor)
        if (this.metricas.taxaAcerto >= metas.taxaAcerto) score += 1;

        // Taxa de Sucesso dos Testes (maior é melhor)
        if (this.metricas.taxaSucessoTestes >= metas.taxaSucessoTestes) score += 1;

        // Bugs em produção (menor é melhor)
        if ((this.metricas.bugsAbertos + this.metricas.bugsFechados) <= 3) score += 1;

        if (score >= 6) return 'EXCELENTE';
        if (score >= 4) return 'BOM';
        if (score >= 2) return 'ATENCAO';
        return 'CRITICO';
    }

    gerarPontosPositivos() {
        const pontos = [];
        const metas = {
            taxaEscape: 5,
            coberturaCodigo: 70,
            mttr: 8,
            taxaAutomacao: 70,
            taxaAcerto: 85
        };

        if (this.metricas.taxaEscape <= metas.taxaEscape) {
            pontos.push('Taxa de escape dentro da meta');
        }
        if (this.metricas.coberturaCodigo >= metas.coberturaCodigo) {
            pontos.push('Cobertura de código adequada');
        }
        if (this.metricas.mttr <= metas.mttr) {
            pontos.push('MTTR dentro do esperado');
        }
        if (this.metricas.taxaAutomacao >= metas.taxaAutomacao) {
            pontos.push('Boa taxa de automação');
        }
        if (this.metricas.taxaAcerto >= metas.taxaAcerto) {
            pontos.push('Excelente taxa de acerto');
        }

        return pontos.length > 0 ? pontos : ['Métricas em análise'];
    }

    gerarPontosAtencao() {
        const pontos = [];
        const metas = {
            taxaEscape: 5,
            coberturaCodigo: 70,
            mttr: 8,
            taxaAutomacao: 70,
            taxaAcerto: 85
        };

        if (this.metricas.taxaEscape > metas.taxaEscape) {
            pontos.push('Taxa de escape acima da meta');
        }
        if (this.metricas.coberturaCodigo < metas.coberturaCodigo) {
            pontos.push('Cobertura de código abaixo da meta');
        }
        if (this.metricas.mttr > metas.mttr) {
            pontos.push('MTTR acima do esperado');
        }
        if (this.metricas.taxaAutomacao < metas.taxaAutomacao) {
            pontos.push('Taxa de automação abaixo da meta');
        }
        if (this.metricas.taxaAcerto < metas.taxaAcerto) {
            pontos.push('Taxa de acerto abaixo da meta');
        }

        return pontos.length > 0 ? pontos : ['Todas as métricas dentro das metas'];
    }

    atualizarDashboard() {
        // Atualizar valores principais
        document.getElementById('taxa-escape-valor').textContent = `${this.metricas.taxaEscape}%`;
        document.getElementById('cobertura-valor').textContent = `${this.metricas.coberturaCodigo}%`;
        document.getElementById('mttr-valor').textContent = `${this.metricas.mttr}h`;
        document.getElementById('automacao-valor').textContent = `${this.metricas.taxaAutomacao}%`;

        // Atualizar métricas secundárias
        document.getElementById('acerto-valor').textContent = `${this.metricas.taxaAcerto}%`;
        
        // Defects (desenvolvimento)
        document.getElementById('defects-fechados-valor').textContent = this.metricas.defectsFechados;
        document.getElementById('defects-abertos-valor').textContent = this.metricas.defectsAbertos;
        
        // Bugs (produção)
        document.getElementById('bugs-fechados-valor').textContent = this.metricas.bugsFechados;
        document.getElementById('bugs-abertos-valor').textContent = this.metricas.bugsAbertos;

        // Métricas de testes
        document.getElementById('testes-criados-valor').textContent = this.metricas.testesCriados;
        document.getElementById('testes-executados-valor').textContent = this.metricas.testesExecutados;
        document.getElementById('taxa-sucesso-testes-valor').textContent = `${this.metricas.taxaSucessoTestes.toFixed(1)}%`;

        // Atualizar status geral
        const statusElement = document.getElementById('status-geral');
        statusElement.textContent = this.metricas.statusGeral;
        statusElement.className = `badge badge-status ${this.getStatusClass(this.metricas.statusGeral)}`;

        // Atualizar data de geração
        document.getElementById('data-geracao').textContent = this.metricas.dataGeracao;

        // Atualizar progress bars
        this.atualizarProgressBars();

        // Atualizar pontos positivos e de atenção
        this.atualizarPontos();

        // Atualizar gráficos
        this.atualizarGraficos();
    }

    getStatusClass(status) {
        switch (status) {
            case 'EXCELENTE': return 'bg-success';
            case 'BOM': return 'bg-primary';
            case 'ATENCAO': return 'bg-warning';
            case 'CRITICO': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    atualizarProgressBars() {
        // Taxa de Escape (invertido - menor é melhor)
        const taxaEscapeProgress = (100 - this.metricas.taxaEscape) / 100 * 100;
        document.getElementById('taxa-escape-progress').style.width = `${Math.min(taxaEscapeProgress, 100)}%`;

        // Cobertura de Código
        document.getElementById('cobertura-progress').style.width = `${this.metricas.coberturaCodigo}%`;

        // MTTR (invertido - menor é melhor)
        const mttrProgress = (8 - this.metricas.mttr) / 8 * 100;
        document.getElementById('mttr-progress').style.width = `${Math.max(mttrProgress, 0)}%`;

        // Taxa de Automação
        document.getElementById('automacao-progress').style.width = `${this.metricas.taxaAutomacao}%`;
    }

    atualizarPontos() {
        const pontosPositivos = document.getElementById('pontos-positivos');
        const pontosAtencao = document.getElementById('pontos-atencao');

        pontosPositivos.innerHTML = this.metricas.pontosPositivos.map(ponto => 
            `<li><i class="bi bi-check-circle text-success"></i> ${ponto}</li>`
        ).join('');

        pontosAtencao.innerHTML = this.metricas.pontosAtencao.map(ponto => 
            `<li><i class="bi bi-exclamation-triangle text-warning"></i> ${ponto}</li>`
        ).join('');
    }

    setupCharts() {
        // Gráfico de Defects vs Bugs
        const ctxDefectsBugs = document.getElementById('defectsBugsChart');
        this.charts.defectsBugs = new Chart(ctxDefectsBugs, {
            type: 'doughnut',
            data: {
                labels: ['Defects (Dev)', 'Bugs (Prod)'],
                datasets: [{
                    data: [23, 5],
                    backgroundColor: ['#f39c12', '#e74c3c'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Gráfico de Comparação com Metas
        const ctxMetas = document.getElementById('metasChart');
        this.charts.metas = new Chart(ctxMetas, {
            type: 'bar',
            data: {
                labels: ['Taxa Escape', 'Cobertura', 'MTTR', 'Automação', 'Acerto', 'Sucesso Testes'],
                datasets: [{
                    label: 'Atual',
                    data: [3.2, 78.5, 6.2, 72.3, 85.7, 90.5],
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1
                }, {
                    label: 'Meta',
                    data: [5, 70, 8, 70, 85, 90],
                    backgroundColor: '#95a5a6',
                    borderColor: '#7f8c8d',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });

        // Gráfico de Status dos Testes
        const ctxTestes = document.getElementById('testesChart');
        this.charts.testes = new Chart(ctxTestes, {
            type: 'doughnut',
            data: {
                labels: ['Passaram', 'Falharam'],
                datasets: [{
                    data: [38, 4],
                    backgroundColor: ['#27ae60', '#e74c3c'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    atualizarGraficos() {
        // Atualizar gráfico Defects vs Bugs
        const totalDefects = this.metricas.defectsAbertos + this.metricas.defectsFechados;
        const totalBugs = this.metricas.bugsAbertos + this.metricas.bugsFechados;
        this.charts.defectsBugs.data.datasets[0].data = [totalDefects, totalBugs];
        this.charts.defectsBugs.update();

        // Atualizar dados dos gráficos com as métricas calculadas
        this.charts.metas.data.datasets[0].data = [
            this.metricas.taxaEscape,
            this.metricas.coberturaCodigo,
            this.metricas.mttr,
            this.metricas.taxaAutomacao,
            this.metricas.taxaAcerto,
            this.metricas.taxaSucessoTestes
        ];
        this.charts.metas.update();

        // Atualizar gráfico de testes
        const testesFalharam = this.metricas.testesExecutados - this.metricas.testesPassaram;
        this.charts.testes.data.datasets[0].data = [this.metricas.testesPassaram, testesFalharam];
        this.charts.testes.update();
    }

    mostrarDashboard() {
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('relatorio').classList.remove('hidden');
    }

    limparDados() {
        // Limpar formulário
        document.querySelectorAll('#entrada-dados input').forEach(input => {
            input.value = '';
        });

        // Esconder dashboard
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('relatorio').classList.add('hidden');

        // Resetar métricas
        this.metricas = {};
    }

    async gerarPDF() {
        try {
            // Verificar bibliotecas
            if (typeof window.jspdf === 'undefined') {
                alert('❌ Erro: Biblioteca jsPDF não carregada.');
                return;
            }
            
            if (typeof html2canvas === 'undefined') {
                alert('❌ Erro: Biblioteca html2canvas não carregada.');
                return;
            }

            // Mostrar loading
            const btnPdf = document.getElementById('gerar-pdf');
            const originalText = btnPdf.innerHTML;
            btnPdf.innerHTML = '<i class="bi bi-hourglass-split"></i> Gerando PDF...';
            btnPdf.disabled = true;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Configurações do documento
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // === PÁGINA 1: CABEÇALHO E RESUMO ===
            
            // Cabeçalho com gradiente simulado
            doc.setFillColor(52, 144, 219); // Azul
            doc.rect(0, 0, pageWidth, 40, 'F');
            
            // Logo/Título principal
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Dashboard de Metricas QA', 20, 25);
            
            // Informações do relatório
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Relatório gerado em: ${this.metricas.dataGeracao}`, 20, 55);
            doc.text(`Equipe: ${this.metricas.equipeResponsavel}`, 20, 65);
            doc.text(`Período: ${this.metricas.periodoAnalise}`, 20, 75);

            // Status geral em card destacado
            const statusColor = this.getStatusColor(this.metricas.statusGeral);
            doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.roundedRect(20, 85, 80, 20, 5, 5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`Status Geral: ${this.metricas.statusGeral}`, 30, 98);

            // Resetar cor
            doc.setTextColor(0, 0, 0);

            // Métricas principais em cards visuais
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Metricas Principais', 20, 125);

            // Card Taxa de Escape
            this.drawMetricCardPDF(doc, 20, 135, 'Taxa de Escape', `${this.metricas.taxaEscape}%`, 'Meta: < 5%', 
                this.metricas.taxaEscape <= 5 ? [39, 174, 96] : [231, 76, 60]);
            
            // Card Cobertura
            this.drawMetricCardPDF(doc, 105, 135, 'Cobertura', `${this.metricas.coberturaCodigo}%`, 'Meta: > 70%', 
                this.metricas.coberturaCodigo >= 70 ? [39, 174, 96] : [231, 76, 60]);
            
            // Card MTTR
            this.drawMetricCardPDF(doc, 20, 175, 'MTTR', `${this.metricas.mttr}h`, 'Meta: < 8h', 
                this.metricas.mttr <= 8 ? [39, 174, 96] : [231, 76, 60]);
            
            // Card Automacao
            this.drawMetricCardPDF(doc, 105, 175, 'Automacao', `${this.metricas.taxaAutomacao}%`, 'Meta: > 70%', 
                this.metricas.taxaAutomacao >= 70 ? [39, 174, 96] : [231, 76, 60]);

            // === PÁGINA 2: GRÁFICOS ===
            doc.addPage();
            
            // Título da página de gráficos
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Analise Visual das Metricas', 20, 30);

            // Capturar gráfico Defects vs Bugs
            try {
                const canvasDefectsBugs = document.getElementById('defectsBugsChart');
                if (canvasDefectsBugs) {
                    const imgData = await this.captureChartAsImage(canvasDefectsBugs);
                    doc.addImage(imgData, 'PNG', 20, 45, 80, 60);
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Defects vs Bugs', 20, 40);
                }
            } catch (e) {
                console.log('Erro ao capturar gráfico Defects vs Bugs:', e);
            }

            // Capturar gráfico de Metas
            try {
                const canvasMetas = document.getElementById('metasChart');
                if (canvasMetas) {
                    const imgData = await this.captureChartAsImage(canvasMetas);
                    doc.addImage(imgData, 'PNG', 20, 120, 80, 60);
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Comparação com Metas', 20, 115);
                }
            } catch (e) {
                console.log('Erro ao capturar gráfico de Metas:', e);
            }

            // === PÁGINA 3: DETALHES ===
            doc.addPage();
            
            // Métricas de testes
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Metricas de Testes', 20, 30);

            // Cards de testes
            this.drawMetricCardPDF(doc, 20, 40, 'Testes Criados', this.metricas.testesCriados.toString(), '', [52, 144, 219]);
            this.drawMetricCardPDF(doc, 105, 40, 'Testes Executados', this.metricas.testesExecutados.toString(), '', [52, 144, 219]);
            this.drawMetricCardPDF(doc, 20, 80, 'Taxa de Sucesso', `${this.metricas.taxaSucessoTestes.toFixed(1)}%`, 'Meta: > 90%', 
                this.metricas.taxaSucessoTestes >= 90 ? [39, 174, 96] : [231, 76, 60]);

            // Status de Defects e Bugs
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Status de Defects e Bugs', 20, 120);

            // Cards de Defects e Bugs
            this.drawMetricCardPDF(doc, 20, 130, 'Defects Abertos', this.metricas.defectsAbertos.toString(), 'Desenvolvimento', [243, 156, 18]);
            this.drawMetricCardPDF(doc, 105, 130, 'Defects Fechados', this.metricas.defectsFechados.toString(), 'Desenvolvimento', [39, 174, 96]);
            this.drawMetricCardPDF(doc, 20, 170, 'Bugs Abertos', this.metricas.bugsAbertos.toString(), 'Produção', [231, 76, 60]);
            this.drawMetricCardPDF(doc, 105, 170, 'Bugs Fechados', this.metricas.bugsFechados.toString(), 'Produção', [39, 174, 96]);

            // === PÁGINA 4: ANÁLISE EXECUTIVA ===
            doc.addPage();
            
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Analise Executiva', 20, 30);

            // Pontos positivos
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(39, 174, 96); // Verde
            doc.text('Pontos Positivos:', 20, 50);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            this.metricas.pontosPositivos.forEach((ponto, index) => {
                doc.text(`- ${ponto}`, 25, 65 + (index * 12));
            });

            // Pontos de atenção
            const yPos = 65 + (this.metricas.pontosPositivos.length * 12) + 20;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(243, 156, 18); // Amarelo
            doc.text('Pontos de Atencao:', 20, yPos);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            this.metricas.pontosAtencao.forEach((ponto, index) => {
                doc.text(`- ${ponto}`, 25, yPos + 15 + (index * 12));
            });

            // Observações
            if (this.metricas.observacoes) {
                const obsYPos = yPos + (this.metricas.pontosAtencao.length * 12) + 30;
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(52, 144, 219); // Azul
                doc.text('Observacoes:', 20, obsYPos);
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.text(this.metricas.observacoes, 20, obsYPos + 15);
            }

            // Rodapé
            doc.setFontSize(9);
            doc.setTextColor(128, 128, 128);
            doc.text('Relatório gerado automaticamente pelo Dashboard QA', pageWidth - 100, pageHeight - 10);

            // Gerar nome do arquivo
            const agora = new Date();
            const dataHora = agora.toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const nomeArquivo = `QA-Metrics-${dataHora}.pdf`;

            // Download do PDF
            doc.save(nomeArquivo);
            
            // Restaurar botão
            btnPdf.innerHTML = originalText;
            btnPdf.disabled = false;
            
            alert('✅ PDF gerado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('❌ Erro ao gerar PDF: ' + error.message);
            
            // Restaurar botão em caso de erro
            const btnPdf = document.getElementById('gerar-pdf');
            btnPdf.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Gerar PDF';
            btnPdf.disabled = false;
        }
    }

    async captureChartAsImage(canvas) {
        return new Promise((resolve) => {
            html2canvas(canvas, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                resolve(imgData);
            }).catch(() => {
                // Fallback: criar imagem simples
                const fallbackCanvas = document.createElement('canvas');
                fallbackCanvas.width = 200;
                fallbackCanvas.height = 150;
                const ctx = fallbackCanvas.getContext('2d');
                ctx.fillStyle = '#f8f9fa';
                ctx.fillRect(0, 0, 200, 150);
                ctx.fillStyle = '#6c757d';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Gráfico não disponível', 100, 75);
                resolve(fallbackCanvas.toDataURL('image/png'));
            });
        });
    }

    drawMetricCardPDF(doc, x, y, title, value, meta, color) {
        // Card background
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(x, y, 80, 35, 3, 3, 'F');
        
        // Border
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(x, y, 80, 35, 3, 3);
        
        // Title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(title, x + 5, y + 8);
        
        // Value
        doc.setFontSize(18);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(value, x + 5, y + 20);
        
        // Meta
        if (meta) {
            doc.setFontSize(7);
            doc.setTextColor(108, 117, 125);
            doc.setFont('helvetica', 'normal');
            doc.text(meta, x + 5, y + 30);
        }
    }


    getStatusColor(status) {
        switch (status) {
            case 'EXCELENTE': return [39, 174, 96]; // Verde
            case 'BOM': return [52, 144, 219]; // Azul
            case 'ATENCAO': return [243, 156, 18]; // Amarelo
            case 'CRITICO': return [231, 76, 60]; // Vermelho
            default: return [149, 165, 166]; // Cinza
        }
    }


    exportarJSON() {
        const dados = {
            ...this.metricas,
            timestamp: new Date().toISOString(),
            versao: '1.0.0'
        };

        const jsonString = JSON.stringify(dados, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        const agora = new Date();
        const dataHora = agora.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const nomeArquivo = `QA-Metrics-${dataHora}.json`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }


    updateDateTime() {
        const agora = new Date();
        const dataHora = agora.toLocaleString('pt-BR');
        document.getElementById('data-geracao').textContent = dataHora;
    }
}

// Inicializar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new QADashboard();
});
