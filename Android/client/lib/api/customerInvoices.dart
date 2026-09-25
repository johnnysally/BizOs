// ignore_for_file: file_names

import 'api_client.dart';

class CustomerInvoicesApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> list({Map<String, dynamic>? query}) =>
      _api.get('/client/invoices/customer', query: query);
  static Future<Response<dynamic>> get(String id) =>
      _api.get('/client/invoices/customer/$id');
  static Future<Response<dynamic>> summary() =>
      _api.get('/client/invoices/customer/summary');
  static Future<Response<dynamic>> create(Map<String, dynamic> data) =>
      _api.post('/client/invoices/customer', data: data);
  static Future<Response<dynamic>> send(String id) =>
      _api.post('/client/invoices/customer/$id/send');
  static Future<Response<dynamic>> recordPayment(
    String id,
    Map<String, dynamic> data,
  ) => _api.post('/client/invoices/customer/$id/payments', data: data);
  static Future<Response<dynamic>> cancel(String id) =>
      _api.post('/client/invoices/customer/$id/cancel');
}
