import requests
from bs4 import BeautifulSoup
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def getprices(): 
    url = "https://compararstreamings.com.br/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all provider containers
        provider_containers = soup.find_all('div', class_=lambda x: x and 'w3-container' in x and 'w3-padding' in x and 'provider-container' in x and 'w3-position-relative' in x)
        
        results = []

        for container in provider_containers:
            try:
                # 1. Name Mapping
                # Try to get name from the drone attributes first as per hint "image-card-container ... dronename"
                # This seems more reliable if structure varies.
                # However, the user also mentioned:
                # <div class="w3-cell"><h2><a href="/provedor/hbo-max">HBO Max</a></h2></div>
                # Let's try the primary way requested: w3-container w3-cell-row -> w3-cell -> h2 -> a
                
                name = None
                
                # Method A: From the header link
                header_container = container.find('div', class_='w3-cell-row')
                if header_container:
                     title_cell = header_container.find('div', class_='w3-cell')
                     if title_cell:
                         h2 = title_cell.find('h2')
                         if h2:
                             a_tag = h2.find('a')
                             if a_tag:
                                 name = a_tag.get_text(strip=True)
                
                # Fallback / Secondary check mentioned: image-card-container -> dronename
                # Note: The "image-card-container" is usually inside the "w3-cell-row" or nearby. 
                # The user said: "para pegar o nome vamos em w3-container image-card-container w3-align-left... e nele é assim ... dronename"
                if not name:
                    image_card = container.find('div', class_=lambda x: x and 'image-card-container' in x)
                    if image_card and image_card.has_attr('dronename'):
                        name = image_card['dronename']


                # 2. Plan and Price Mapping
                # Look for "info-container" inside "image-container-in"
                # Note: There can be multiple plans per provider logic-wise, but the structure suggests checking `info-container`
                
                info_containers = container.find_all('div', class_='info-container')
                
                # If no specific info_container div found, it might be directly in the card or struct varies.
                # User says: "image-container-in w3-card w3-hover-shadow" -> "info-container"
                
                # Let's iterate over ALL info-containers found within this provider block to capture all plans
                # The user request implies getting "the" price, but a provider often has multiple.
                # "se deve mapear 3 coisas, primeiro nome, segundo plano e por ultimo preço."
                # Does this mean 1 entry per plan? Usually yes for "compare plans". 
                # Let's assume we extract all valid plans found in this provider container.

                if not info_containers:
                     # Try finding deeper standard w3 structure if top level search fails
                     image_container_in = container.find('div', class_=lambda x: x and 'image-container-in' in x)
                     if image_container_in:
                         info_containers = image_container_in.find_all('div', class_='info-container')

                for info in info_containers:
                    # Plan Name: h3
                    plan_name = "Unknown Plan"
                    h3 = info.find('h3')
                    if h3:
                        plan_name = h3.get_text(strip=True)

                    # Price
                    price = "0,00"
                    
                    # Logic: "entao se tiver a classe 'price' dentro de info-container de la que se deve pegar o preço, se não se deve pegar do span logo abaixo do h3"
                    
                    # 1. Check for specific price class (user said "class 'price'", commonly might be `data-field-id="price"` or class="price"?)
                    # User example: <span data-field-id="price">R$ 0,00</span>
                    # But text says: "se tiver a classe 'price'". I'll check for class="price" OR data-field-id="price" to be safe given the snippet.
                    # Actually, the snippet: `<span class="striped"> R$ 55,90</span>&nbsp;<span data-field-id="price">R$ 0,00</span>`
                    # The prompt says: "entao se tiver a classe "price"..."
                    # Let's look for element with class 'price' first.
                    
                    price_element = info.find(class_='price')
                    
                    if not price_element:
                        # User example shows `data-field-id="price"`. Let's check that too as a fallback for "class price" intent.
                        price_element = info.find(attrs={"data-field-id": "price"})
                    
                    if price_element:
                        price = price_element.get_text(strip=True)
                    else:
                        # "se não se deve pegar do span logo abaixo do h3"
                        # User example 1: <h3>...</h3> <span>R$ 59,00</span>
                        if h3:
                            next_span = h3.find_next_sibling('span')
                            if next_span:
                                price = next_span.get_text(strip=True)
                    
                    # Clean up price if needed (e.g., remove R$, trim)
                    # Keeping it raw string as requested "get price" usually implies the string value.
                    
                    if name and plan_name:
                         results.append({
                             "nome": name,
                             "plano": plan_name,
                             "preco": price
                         })

            except Exception as e:
                logging.error(f"Error parsing a container: {e}")
                continue

        return json.dumps(results, ensure_ascii=False, indent=2)

    except requests.RequestException as e:
        logging.error(f"Request failed: {e}")
        return json.dumps({"error": str(e)})
    except Exception as e:
        logging.error(f"General error: {e}")
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    print(getprices())
