// ignore_for_file: file_names

import 'api_client.dart';

class PurchaseOrdersApi {
  static final _api = BizOsApiClient.instance;

  static Future<List<Map<String, dynamic>>> list({
    Map<String, dynamic>? query,
  }) async =>
      _api.list(await _api.get('/client/purchase-orders', query: query));
  static Future<Response<dynamic>> create(Map<String, dynamic> data) =>
      _api.post('/client/purchase-orders', data: data);
  static Future<Response<dynamic>> get(String id) =>
      _api.get('/client/purchase-orders/$id');
  static Future<Response<dynamic>> update(
    String id,
    Map<String, dynamic> data,
  ) => _api.patch('/client/purchase-orders/$id', data: data);
  static Future<Response<dynamic>> send(String id) =>
      _api.post('/client/purchase-orders/$id/send');
  static Future<Response<dynamic>> receive(
    String id, {
    Map<String, dynamic>? data,
  }) => _api.post('/client/purchase-orders/$id/receive', data: data);
  static Future<Response<dynamic>> cancel(
    String id, {
    Map<String, dynamic>? data,
  }) => _api.post('/client/purchase-orders/$id/cancel', data: data);
  static Future<Response<dynamic>> pdf(String id) =>
      _api.get('/client/purchase-orders/$id/pdf');
}
