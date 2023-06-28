const TOKEN = import.meta.env.VITE_TOKEN;

export const searchCities = async (term) => {
//   seu código aqui
  const API_CITIES = `http://api.weatherapi.com/v1/search.json?lang=pt&key=${TOKEN}&q=${term}`;
  try {
    const CITY = await fetch(API_CITIES);
    const data = await CITY.json();
    if (data.length === 0) {
      window.alert('Nenhuma cidade encontrada');
    }
    return data;
  } catch (error) {
    return error;
  }
};

export const getWeatherByCity = async (cityURL) => {
//   seu código aqui
  const result = {};
  const API_CITY = `http://api.weatherapi.com/v1/current.json?lang=pt&key=${TOKEN}&q=${cityURL}`;
  const CITY = await fetch(API_CITY);
  const data = await CITY.json();
  const { current } = data;
  result.temp = current.temp_c;
  result.condition = current.condition.text;
  result.icon = current.condition.icon;
  return result;
};
