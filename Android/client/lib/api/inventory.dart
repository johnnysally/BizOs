import 'api_client.dart';

class InventoryApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> list({Map<String, dynamic>? query}) =>
      _api.get('/client/inventory', query: query);
  static Future<Response<dynamic>> adjust(Map<String, dynamic> data) =>
      _api.post('/client/inventory/adjust', data: data);
  static Future<Response<dynamic>> history(
    String productId, {
    Map<String, dynamic>? query,
  }) => _api.get('/client/inventory/$productId/history', query: query);
}
