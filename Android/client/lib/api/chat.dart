import 'api_client.dart';

class ChatApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> message(Map<String, dynamic> data) =>
      _api.post('/client/chat/message', data: data);
  static Future<Response<dynamic>> history({Map<String, dynamic>? query}) =>
      _api.get('/client/chat/history', query: query);
  static Future<Response<dynamic>> clear() =>
      _api.delete('/client/chat/history');
}
