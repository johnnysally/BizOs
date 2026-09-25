import 'api_client.dart';

class SuppliersApi {
  static final _api = BizOsApiClient.instance;

  static Future<List<Map<String, dynamic>>> list({
    Map<String, dynamic>? query,
  }) async => _api.list(await _api.get('/client/suppliers', query: query));
  static Future<Response<dynamic>> create(Map<String, dynamic> data) =>
      _api.post('/client/suppliers', data: data);
  static Future<Response<dynamic>> get(String id) =>
      _api.get('/client/suppliers/$id');
  static Future<Response<dynamic>> update(
    String id,
    Map<String, dynamic> data,
  ) => _api.patch('/client/suppliers/$id', data: data);
  static Future<Response<dynamic>> remove(String id) =>
      _api.delete('/client/suppliers/$id');
  static Future<Response<dynamic>> orders(
    String id, {
    Map<String, dynamic>? query,
  }) => _api.get('/client/suppliers/$id/orders', query: query);
}
