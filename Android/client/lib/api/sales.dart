import 'api_client.dart';

class SalesApi {
  static final _api = BizOsApiClient.instance;

  static Future<List<Map<String, dynamic>>> list({
    Map<String, dynamic>? query,
  }) async => _api.list(await _api.get('/client/sales', query: query));
  static Future<Response<dynamic>> create(Map<String, dynamic> data) =>
      _api.post('/client/sales', data: data);
  static Future<Response<dynamic>> get(String id) =>
      _api.get('/client/sales/$id');
  static Future<Response<dynamic>> voidSale(
    String id, {
    Map<String, dynamic>? data,
  }) => _api.post('/client/sales/$id/void', data: data);
  static Future<Response<dynamic>> reprint(String id) =>
      _api.post('/client/sales/$id/reprint');
}
