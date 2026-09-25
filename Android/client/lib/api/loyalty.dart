import 'api_client.dart';

class LoyaltyApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> config() =>
      _api.get('/client/loyalty/config');
  static Future<Response<dynamic>> balance(String customerId) =>
      _api.get('/client/loyalty/customers/$customerId');
  static Future<Response<dynamic>> history(
    String customerId, {
    Map<String, dynamic>? query,
  }) => _api.get('/client/loyalty/customers/$customerId/history', query: query);
  static Future<Response<dynamic>> adjust(
    String customerId,
    Map<String, dynamic> data,
  ) => _api.post('/client/loyalty/customers/$customerId/adjust', data: data);
  static Future<Response<dynamic>> redeem(
    String customerId,
    Map<String, dynamic> data,
  ) => _api.post('/client/loyalty/customers/$customerId/redeem', data: data);
}
