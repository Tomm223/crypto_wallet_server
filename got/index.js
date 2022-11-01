const got = require('got')
//const got = await import('got')
/*var got
(async () => {
   got = await import('got');

})().catch(err => console.error(err));
/*
const { data } = await got.post('https://httpbin.org/anything', {
   json: {
      hello: 'world'
   }
}).json();
*/


class gotingServer {
   async getCoinById(id) {
      const resp = await got(`https://api.coingecko.com/api/v3/coins/${id}`).json() /*?localization=true&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true*/
      return resp
   }
   async getMarketCoins({ page, limit, currency = 'usd' }) {
      const resp = await got(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&per_page=${limit}&page=${page}&sparkline=true&price_change_percentage=1h%2C24h%2C7d`).json()
      return resp
   }
   async getListCategoriesCoin() {
      const resp = await got('https://api.coingecko.com/api/v3/coins/categories/list').json()
      return resp
   }
   async search(query) {
      const resp = await got(`https://api.coingecko.com/api/v3/search?query=${query}`).json()
      return resp
   }
   async convert(crypto, currency) {
      const resp = await got(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${currency}`).json()
      return { crypto, currency, target: resp[`${crypto}`][`${currency}`] }
   }
   async getChartPriceWallet(coinId, targetCurr, dateStart, dateEnd) {
      const resp = await got(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=${targetCurr}&from=${dateStart}&to=${dateEnd}`).json()
      return resp.prices
   }
   async getCoinsList() {
      const resp = await got(`https://api.coingecko.com/api/v3/coins/list?include_platform=false`).json()
      return resp
   }

}

module.exports = new gotingServer()