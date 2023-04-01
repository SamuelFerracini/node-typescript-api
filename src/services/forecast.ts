import { StormGlass, IForecastPoint } from '@src/clients/stormGlass'

export enum EBeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N'
}

export interface IBeach {
  name: string
  position: EBeachPosition
  lat: number
  lng: number
  user: string
}

export interface IBeachForecast extends Omit<IBeach, 'user'>, IForecastPoint {}

export interface ITimeForecast {
  time: string
  forecast: IBeachForecast[]
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: IBeach[]
  ): Promise<ITimeForecast[]> {
    const pointsWithCorrectSources: IBeachForecast[] = []

    for (const beach of beaches) {
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
      const enrichedBeachData = points.map((e) => ({
        ...{},
        ...{
          lat: beach.lat,
          lng: beach.lng,
          name: beach.name,
          position: beach.position,
          rating: 1 // TODO: Implement rating service
        },
        ...e
      }))
      pointsWithCorrectSources.push(...enrichedBeachData)
    }

    return this.mapForecastByTime(pointsWithCorrectSources)
  }

  private mapForecastByTime(forecast: IBeachForecast[]): ITimeForecast[] {
    const forecastByTime: ITimeForecast[] = []

    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time)

      if (timePoint) timePoint.forecast.push(point)
      else
        forecastByTime.push({
          time: point.time,
          forecast: [point]
        })
    }

    return forecastByTime
  }
}
