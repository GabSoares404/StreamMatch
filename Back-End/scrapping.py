# Importação de Bibliotecas Necessárias para o Web Scraping (Raspagem de Dados):
# - `requests`: Usada para acessar sites, copiando a ação de você abrir um link no navegador de internet.
# - `BeautifulSoup`: Funciona como uma tesoura inteligente para recortar e organizar os elementos do código HTML da página web.
# - `json`: Utilizada para converter e formatar os dados que coletamos em um texto arrumado tipo "JSON", comum em respostas de APIs.
# - `logging`: Usada para registrar mensagens na tela com o que está acontecendo (como um caderninho de anotações do robô).
import requests
from bs4 import BeautifulSoup
import json
import logging

# Configura o sistema de log (notas e avisos) descrevendo como exibir o horário, a importância da mensagem e a mensagem final.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def getprices(): 
    url = "https://compararstreamings.com.br/"
    
    # É preciso "enganar" o site dizendo que nós somos um navegador real (como o Google Chrome do Windows).
    # Caso contrário, alguns sites bloqueiam acessos bloqueando "robôs" pela falta de um User-Agent.
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    # A estrutura "try" e "except" é a forma do Python lidar com erros - "tente fazer o que tem aqui (try), mas se parar por um erro grave, vá pro (except)".
    try:
        # A função `requests.get(...)` tenta acessar a internet e "puxar" toda as informações de texto da URL fornecida. 
        response = requests.get(url, headers=headers)
        
        # A função `.raise_for_status()` exige sucesso. Ela verifica se o site respondeu "OK (Erro 200)". Se der "Erro 404 - Não Encontrado", o código é jogado para fora (pro except) imediatamente.
        response.raise_for_status()
        
        # Pega a resposta bagunçada da rede `response.content` e manda para a biblioteca `BeautifulSoup`.
        # O argumento `'html.parser'` transforma isso num mapa de tags HTML navegável que podemos procurar por palavras e seções específicas.
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Encontra todos os "blocos" ou "caixas" no código do site que contêm as informações de cada serviço de streaming.
        # Usa a função `soup.find_all(...)` que procura por múltiplos elementos (neste caso, 'div') que tenham certas classes CSS.
        provider_containers = soup.find_all('div', class_=lambda x: x and 'w3-container' in x and 'w3-padding' in x and 'provider-container' in x and 'w3-position-relative' in x)
        
        # Cria uma lista (matriz) em branco onde em breve colocaremos as informações raspadas.
        results = []

        # Inicia um looping rotatório (um laço "for") que passa item por item através de todos os 'blocos' de serviços que achou acima.
        for container in provider_containers:
            # Emprega um novo bloco 'try...except' para que se o robô der erro ao processar um card das listas (exemplo: site fora do ar), ele pule esse e continue pros próximos, e não quebre a execução por inteiro.
            try:
                # 1. Passo um: Descobrir o nome do serviço (ex: Netflix).
                # Como os sites são construídos de várias formas, o robô tenta encontrar de algumas formas diferentes.
                
                name = None
                
                # Tentativa 1: Procurar o nome no título grande em destaque no começo do bloco.
                # Usa a função `container.find('div', ...)` para pegar apenas o primeiro bloco 'div' com as classes especificadas.
                header_container = container.find('div', class_='w3-cell-row')
                if header_container:
                     title_cell = header_container.find('div', class_='w3-cell')
                     if title_cell:
                         h2 = title_cell.find('h2')
                         if h2:
                             # Função `find('a')` pega a tag de link (A) e `get_text(strip=True)` extrai apenas o texto legível sem os códigos ao redor.
                             a_tag = h2.find('a')
                             if a_tag:
                                 name = a_tag.get_text(strip=True)
                
                # Tentativa 2 (Plano B): Se a primeira tentativa falhar, ele tenta achar um "texto escondido"
                # na estrutura de organização que diz 'dronename' e que serve como uma etiqueta do nome oficial do local.
                # A função `has_attr` tenta ver se o elemento HTML possui este atributo 'dronename'.
                if not name:
                    image_card = container.find('div', class_=lambda x: x and 'image-card-container' in x)
                    if image_card and image_card.has_attr('dronename'):
                        name = image_card['dronename']


                # 2. Passo dois e três: Descobrir o tipo do Plano e o Preço.
                # Cada serviço de vídeo pode ter vários planos (ex: Básico, Premium).
                # Então agora ele vai passar por uma lista de todas as "caixinhas" com planos. 
                # Função `container.find_all('div', ...)` pega uma listagem de todas as caixas de planos dentro do provedor atual.
                
                info_containers = container.find_all('div', class_='info-container')
                
                # Se não encontrar as caixinhas de primeira, tenta procurar dentro de outra área do site chamada "image-container-in".
                # A ideia é varrer toda essa embalagem de informação para não deixar nenhum plano de assinatura despercebido usando novamente `find` e `find_all`.
                # Tenta achar os planos na estrutura normal usando o `find_all` para varrer um leque de tags filhas.
                if not info_containers:
                    # A busca "lambda" (lambda x: x and ...) no find cria uma função sob medida em tempo real para ler a lista comprida de classes da hierarquia do site (a procura pelo "image-container-in").
                    image_container_in = container.find('div', class_=lambda x: x and 'image-container-in' in x)
                    if image_container_in:
                        info_containers = image_container_in.find_all('div', class_='info-container')

                # Agora cria mais um Loop (laço 'for') para fatiar caixinha de assinatura achada do respectivo plano.
                for info in info_containers:
                    # Pega o Nome do Plano que geralmente é o título principal da caixinha (representado pelo elemento html 'H3')
                    # Usa `info.find('h3')` para procurar a tag e `.get_text(...)` para separar só as palavras em texto.
                    plan_name = "Unknown Plan"
                    h3 = info.find('h3')
                    if h3:
                        plan_name = h3.get_text(strip=True)

                    # Preço
                    price = "0,00"
                    
                    # Lógica para achar o preço do plano:
                    # O robô procura algo que esteja usando a formatação com classe 'price' com a função `info.find(class_='price')`
                    
                    price_element = info.find(class_='price')
                    
                    if not price_element:
                        # Se não encontrar nada marcado explicitamente como classe 'price', o robô checa outro marcador (atributo "data-field-id") com `info.find(...)`.
                        price_element = info.find(attrs={"data-field-id": "price"})
                    
                    if price_element:
                        # Se achar o elemento de preço, extrai o número limpo de espaços laterais usando `get_text(strip=True)`.
                        price = price_element.get_text(strip=True)
                    else:
                        # Se todas as outras tentativas de achar o texto certo do valor falharem...
                        # Ele pega simplesmente o próximo pedaço de texto comum (span) que aparecer logo em seguida depois do título (h3).
                        # A função `h3.find_next_sibling('span')` é literalmente "Encontre o irmão mais perto à frente" que contêm a tag de span.
                        if h3:
                            next_span = h3.find_next_sibling('span')
                            if next_span:
                                price = next_span.get_text(strip=True)
                    
                    # Finalizando a coleta daquele quadro de assinatura: 
                    # Se tivermos achado o nome do serviço e o nome do plano contido dentro dele com sucesso...
                    
                    # Se tivermos achado as strings de nome do serviço e plano, nós criamos um mini "dicionário" no formato JSON.
                    # Por fim, usamos o comando `results.append(...)` que adiciona essa nova anotação à lista final ("results") que estavamos construindo.
                    if name and plan_name:
                         results.append({
                             "nome": name,
                             "plano": plan_name,
                             "preco": price
                         })

            # Comando onde o erro (causado por problema num box de info e pego pela estrutura except) vai ser engolido ou descrito pro painel, prosseguindo com `continue` direto pra varrer a próxima caixinha sem quebrar.
            except Exception as e:
                logging.error(f"Error parsing a container: {e}")
                continue

        # Transforma nossa lista inteira do Python com as descobertas num texto final estruturado universal, um "JSON grande de exportação" usando a função dumps (`json.dumps()`).
        # Garante a formatação sem caracteres zoados pelo inglês (`ensure_ascii=False`) de nosso português e adiciona uns tab espaçamentos bonitinhos pra leitura (`indent=2`).
        return json.dumps(results, ensure_ascii=False, indent=2)

    # Blocos de defesa criados lá em cima... (O "tente puxar dados").
    # Se estourar a conexão inteira do `requests` e gerar uma falha de "RequestException"...
    except requests.RequestException as e:
        # Puxa o erro jogando a quebra de conexão pelo logger e retorna o problema disfarçado em formato de json.
        logging.error(f"Request failed: {e}")
        return json.dumps({"error": str(e)})
    except Exception as e:
        # Se pipou algo inusitado lá, erro fora do normal do site.
        logging.error(f"General error: {e}")
        return json.dumps({"error": str(e)})

# O bloco abaixo `if __name__ == "__main__":` instrui o programa a não entrar em execução automaticamente se este arquivo servir como biblioteca pra outro arquivo.
# Porém, ele executa e "chama" print a função caso este script em si for rodado diretamente (por exemplo rodando: python scrapping.py).
if __name__ == "__main__":
    print(getprices())
