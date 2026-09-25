import 'api_client.dart';

class CustomersApi {
  static final _api = BizOsApiClient.instance;

  static Future<List<Map<String, dynamic>>> list({
    Map<String, dynamic>? query,
  }) async => _api.list(await _api.get('/client/customers', query: query));
  static Future<Response<dynamic>> create(Map<String, dynamic> data) =>
      _api.post('/client/customers', data: data);
  static Future<Response<dynamic>> get(String id) =>
      _api.get('/client/customers/$id');
  static Future<Response<dynamic>> update(
    String id,
    Map<String, dynamic> data,
  ) => _api.patch('/client/customers/$id', data: data);
  static Future<Response<dynamic>> remove(String id) =>
      _api.delete('/client/customers/$id');
}
