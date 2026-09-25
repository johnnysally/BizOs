// ignore_for_file: file_names

import 'api_client.dart';

class HeldSalesApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> list({Map<String, dynamic>? query}) =>
      _api.get('/client/held-sales', query: query);
  static Future<Response<dynamic>> create(Map<String, dynamic> data) =>
      _api.post('/client/held-sales', data: data);
  static Future<Response<dynamic>> resume(String id) =>
      _api.post('/client/held-sales/$id/resume');
  static Future<Response<dynamic>> remove(String id) =>
      _api.delete('/client/held-sales/$id');
}
