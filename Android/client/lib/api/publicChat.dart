// ignore_for_file: file_names

import 'api_client.dart';

class PublicChatApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> message(Map<String, dynamic> data) =>
      _api.post('/public/chat/message', data: data);
}
