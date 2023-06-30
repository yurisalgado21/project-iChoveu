import { searchCities, getWeatherByCity, TOKEN } from './weatherAPI';

/**
 * Cria um elemento HTML com as informações passadas
 */
function createElement(tagName, className, textContent = '') {
  const element = document.createElement(tagName);
  element.classList.add(...className.split(' '));
  element.textContent = textContent;
  return element;
}

/**
 * Recebe as informações de uma previsão e retorna um elemento HTML
 */
function createForecast(forecast) {
  const { date, maxTemp, minTemp, condition, icon } = forecast;

  const weekday = new Date(date);
  weekday.setDate(weekday.getDate() + 1);
  const weekdayName = weekday.toLocaleDateString('pt-BR', { weekday: 'short' });

  const forecastElement = createElement('div', 'forecast');
  const dateElement = createElement('p', 'forecast-weekday', weekdayName);

  const maxElement = createElement('span', 'forecast-temp max', 'max');
  const maxTempElement = createElement('span', 'forecast-temp max', `${maxTemp}º`);
  const minElement = createElement('span', 'forecast-temp min', 'min');
  const minTempElement = createElement('span', 'forecast-temp min', `${minTemp}º`);
  const tempContainer = createElement('div', 'forecast-temp-container');
  tempContainer.appendChild(maxElement);
  tempContainer.appendChild(minElement);
  tempContainer.appendChild(maxTempElement);
  tempContainer.appendChild(minTempElement);

  const conditionElement = createElement('p', 'forecast-condition', condition);
  const iconElement = createElement('img', 'forecast-icon');
  iconElement.src = icon.replace('64x64', '128x128');

  const middleContainer = createElement('div', 'forecast-middle-container');
  middleContainer.appendChild(tempContainer);
  middleContainer.appendChild(iconElement);

  forecastElement.appendChild(dateElement);
  forecastElement.appendChild(middleContainer);
  forecastElement.appendChild(conditionElement);

  return forecastElement;
}

/**
 * Limpa todos os elementos filhos de um dado elemento
 */
function clearChildrenById(elementId) {
  const citiesList = document.getElementById(elementId);
  while (citiesList.firstChild) {
    citiesList.removeChild(citiesList.firstChild);
  }
}

/**
 * Recebe uma lista de previsões e as exibe na tela dentro de um modal
 */
export function showForecast(forecastList) {
  const forecastContainer = document.getElementById('forecast-container');
  const weekdayContainer = document.getElementById('weekdays');
  clearChildrenById('weekdays');
  forecastList.forEach((forecast) => {
    const weekdayElement = createForecast(forecast);
    weekdayContainer.appendChild(weekdayElement);
  });
  console.log(forecastList);
  forecastContainer.classList.remove('hidden');
}

/**
 * Recebe um objeto com as informações de uma cidade e retorna um elemento HTML
 */
export function createCityElement(cityInfo) {
  const { name, country, temp, condition, icon, url } = cityInfo;
  const cityElement = createElement('li', 'city');

  const button = createElement('button', 'button');
  button.innerText = 'Ver previsão';
  const headingElement = createElement('div', 'city-heading');
  const nameElement = createElement('h2', 'city-name', name);
  const countryElement = createElement('p', 'city-country', country);
  headingElement.appendChild(nameElement);
  headingElement.appendChild(countryElement);

  const tempElement = createElement('p', 'city-temp', `${temp}º`);
  const conditionElement = createElement('p', 'city-condition', condition);

  const tempContainer = createElement('div', 'city-temp-container');
  tempContainer.appendChild(conditionElement);
  tempContainer.appendChild(tempElement);

  const iconElement = createElement('img', 'condition-icon');
  iconElement.src = icon.replace('64x64', '128x128');

  const infoContainer = createElement('div', 'city-info-container');
  infoContainer.appendChild(tempContainer);
  infoContainer.appendChild(iconElement);

  const urlContainer = createElement('div', 'url-container');
  const urlEl = createElement('p', 'city-url', url);
  urlContainer.appendChild(urlEl);

  cityElement.appendChild(headingElement);
  cityElement.appendChild(infoContainer);
  cityElement.appendChild(button);
  button.addEventListener('click', async () => {
    const API_CITIES = `http://api.weatherapi.com/v1/forecast.json?lang=pt&key=${TOKEN}&q=${cityInfo.url}&days=7`;
    const cities = await fetch(API_CITIES);
    const data = await cities.json();
    const forecast = data.forecast.forecastday;
    const forecastResult = forecast.map((days) => ({
      date: days.date,
      maxTemp: days.day.maxtemp_c,
      minTemp: days.day.mintemp_c,
      condition: days.day.condition.text,
      icon: days.day.condition.icon,
    }));
    showForecast(forecastResult);
  });

  return cityElement;
}

/**
 * Lida com o evento de submit do formulário de busca
 */
export async function handleSearch(event) {
  event.preventDefault();
  clearChildrenById('cities');

  const ul = document.querySelector('#cities');
  const searchInput = document.getElementById('search-input');
  const searchValue = searchInput.value;
  // Aqui estão minhas cidades.
  const getCities = await searchCities(searchValue);
  const everyCitiesSpecific = getCities.map((city) => getWeatherByCity(city.url));
  Promise.all(everyCitiesSpecific).then((everycities) => everycities
    .forEach((city, index) => {
      const result = {
        name: city.location.name,
        country: city.location.country,
        temp: city.current.temp_c,
        condition: city.current.condition.text,
        icon: city.current.condition.icon,
        url: getCities[index].url,
      };
      ul.appendChild(createCityElement(result));
    }));
}
