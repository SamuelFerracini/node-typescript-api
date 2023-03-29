import stormglassNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json'
import stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json'

import { StormGlass } from '@src/clients/stormGlass'
import * as HttpUtil from '@src/util/request'

jest.mock('@src/util/request')

describe('StormGlass client', () => {
  /**
   * Used for static method's mocks
   */
  const MockedRequestClass = HttpUtil.Request as jest.Mocked<
    typeof HttpUtil.Request
  >

  /**
   * Used for fake lat and lng on tests
   */
  const fakeLocation = {
    lat: -33.792726,
    lng: 151.289824
  }

  /**
   * Used for instance method's mocks
   */
  const mockedRequest = new HttpUtil.Request() as jest.Mocked<HttpUtil.Request>
  it('should return the normalized forecast from the StormGlass service', async () => {
    mockedRequest.get.mockResolvedValue({
      data: stormglassWeatherPointFixture
    } as HttpUtil.IResponse)

    const stormGlass = new StormGlass(mockedRequest)
    const response = await stormGlass.fetchPoints(
      fakeLocation.lat,
      fakeLocation.lng
    )
    expect(response).toEqual(stormglassNormalizedResponseFixture)
  })

  it('should exclude incomplete data points', async () => {
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300
          },
          time: '2020-04-26T00:00:00+00:00'
        }
      ]
    }
    mockedRequest.get.mockResolvedValue({
      data: incompleteResponse
    } as HttpUtil.IResponse)

    const stormGlass = new StormGlass(mockedRequest)
    const response = await stormGlass.fetchPoints(
      fakeLocation.lat,
      fakeLocation.lng
    )

    expect(response).toEqual([])
  })

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    mockedRequest.get.mockRejectedValue('Network Error')

    const stormGlass = new StormGlass(mockedRequest)

    await expect(
      stormGlass.fetchPoints(fakeLocation.lat, fakeLocation.lng)
    ).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: "Network Error"'
    )
  })

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    class FakeAxiosError extends Error {
      constructor(public response: object) {
        super()
      }
    }

    mockedRequest.get.mockRejectedValue(
      new FakeAxiosError({
        status: 429,
        data: { errors: ['Rate Limit reached'] }
      })
    )

    MockedRequestClass.isRequestError.mockReturnValue(true)

    MockedRequestClass.extractErrorData.mockReturnValue({
      status: 429,
      data: { errors: ['Rate Limit reached'] }
    })

    const stormGlass = new StormGlass(mockedRequest)

    await expect(
      stormGlass.fetchPoints(fakeLocation.lat, fakeLocation.lng)
    ).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    )
  })
})
