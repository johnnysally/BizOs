// ignore_for_file: file_names

import 'api_client.dart';

class PublicInvoicesApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> get(String invoiceNumber) =>
      _api.get('/public/invoices/$invoiceNumber');
  static Future<Response<dynamic>> sendStk(
    String invoiceNumber,
    String phone,
  ) => _api.post(
    '/public/payments/stk/invoice',
    data: {'invoiceNumber': invoiceNumber, 'phone': phone},
  );
}
