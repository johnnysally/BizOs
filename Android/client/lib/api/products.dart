import 'api_client.dart';

class ProductsApi {
  static final _api = BizOsApiClient.instance;

  static Future<List<Map<String, dynamic>>> list({
    Map<String, dynamic>? query,
  }) async => _api.list(await _api.get('/client/products', query: query));
  static Future<Response<dynamic>> create(Map<String, dynamic> data) =>
      _api.post('/client/products', data: data);
  static Future<Response<dynamic>> get(String id) =>
      _api.get('/client/products/$id');
  static Future<Response<dynamic>> update(
    String id,
    Map<String, dynamic> data,
  ) => _api.patch('/client/products/$id', data: data);
  static Future<Response<dynamic>> remove(String id) =>
      _api.delete('/client/products/$id');
  static Future<Response<dynamic>> uploadImage(FormData data) =>
      _api.dio.post('/client/products/upload-image', data: data);
}
