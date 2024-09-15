let taxaDolar;
        let taxaEuro;

        function formatarData(data) {
            const mes = (data.getMonth() + 1).toString().padStart(2, '0');
            const dia = data.getDate().toString().padStart(2, '0');
            const ano = data.getFullYear();
            return `${mes}-${dia}-${ano}`;
        }

        async function buscarCotacoes() {
            try {
                let data = new Date();
                let tentativas = 0;
                const maxTentativas = 5;

                while (tentativas < maxTentativas) {
                    const dataFormatada = formatarData(data);
                    const urlDolar = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${dataFormatada}'&$top=1&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`;
                    const urlEuro = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='EUR'&@dataCotacao='${dataFormatada}'&$top=1&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`;
                    
                    const [responseDolar, responseEuro] = await Promise.all([
                        fetch(urlDolar),
                        fetch(urlEuro)
                    ]);
                    const dadosDolar = await responseDolar.json();
                    const dadosEuro = await responseEuro.json();

                    if (dadosDolar.value.length > 0 && dadosEuro.value.length > 0) {
                        taxaDolar = (dadosDolar.value[0].cotacaoCompra + dadosDolar.value[0].cotacaoVenda) / 2;
                        taxaEuro = (dadosEuro.value[0].cotacaoCompra + dadosEuro.value[0].cotacaoVenda) / 2;
                        const dataHoraCotacao = new Date(dadosDolar.value[0].dataHoraCotacao).toLocaleString('pt-BR');
                        document.getElementById('cotacao').innerHTML = `Cotações em ${dataHoraCotacao}:<br>1 USD = ${taxaDolar.toFixed(4)} BRL<br>1 EUR = ${taxaEuro.toFixed(4)} BRL`;
                        return;
                    }

                    data.setDate(data.getDate() - 1);
                    tentativas++;
                }

                throw new Error('Não foi possível obter as cotações após várias tentativas.');
            } catch (error) {
                console.error('Erro ao buscar cotações:', error);
                document.getElementById('cotacao').textContent = 'Erro ao buscar cotações. Tente novamente mais tarde.';
            }
        }

        function atualizarLabels() {
            const moeda = document.getElementById('moedaEstrangeira').value;
            const moedaLabel = moeda === 'USD' ? 'Dólar' : 'Euro';
            document.querySelectorAll('.moedaLabel').forEach(el => el.textContent = moedaLabel);
        }

        function converterParaReal() {
            const valorEstrangeiro = parseFloat(document.getElementById('valorEstrangeiro').value);
            const moeda = document.getElementById('moedaEstrangeira').value;
            if (isNaN(valorEstrangeiro)) {
                alert('Por favor, insira um valor válido.');
                return;
            }
            const taxa = moeda === 'USD' ? taxaDolar : taxaEuro;
            const valorReal = valorEstrangeiro * taxa;
            document.getElementById('resultado').textContent = `${valorEstrangeiro.toFixed(2)} ${moeda} = ${valorReal.toFixed(2)} BRL`;
        }

        function converterParaEstrangeiro() {
            const valorReal = parseFloat(document.getElementById('valorReal').value);
            const moeda = document.getElementById('moedaEstrangeira').value;
            if (isNaN(valorReal)) {
                alert('Por favor, insira um valor válido em real.');
                return;
            }
            const taxa = moeda === 'USD' ? taxaDolar : taxaEuro;
            const valorEstrangeiro = valorReal / taxa;
            document.getElementById('resultado').textContent = `${valorReal.toFixed(2)} BRL = ${valorEstrangeiro.toFixed(2)} ${moeda}`;
        }

        function limparTudo() {
            document.getElementById('valorEstrangeiro').value = '';
            document.getElementById('valorReal').value = '';
            document.getElementById('resultado').textContent = '';
        }

        buscarCotacoes();
        atualizarLabels();