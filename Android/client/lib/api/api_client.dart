import 'package:bizos/constants.dart';
import 'package:bizos/services/storage_service.dart';
import 'package:dio/dio.dart';
export 'package:dio/dio.dart';

class BizOsApiClient {
  BizOsApiClient._();

  static final BizOsApiClient instance = BizOsApiClient._();

  final Dio dio =
      Dio(
          BaseOptions(
            baseUrl: kApiBaseUrl,
            connectTimeout: const Duration(seconds: 30),
            receiveTimeout: const Duration(seconds: 30),
            headers: {'Content-Type': 'application/json'},
          ),
        )
        ..interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) async {
              final token = await StorageService.getAccessToken();
              if (token != null && token.isNotEmpty) {
                options.headers['Authorization'] = 'Bearer $token';
              }
              handler.next(options);
            },
          ),
        );

  Future<Response<dynamic>> get(String path, {Map<String, dynamic>? query}) =>
      dio.get(path, queryParameters: query);

  Future<Response<dynamic>> post(String path, {Object? data}) =>
      dio.post(path, data: data);

  Future<Response<dynamic>> patch(String path, {Object? data}) =>
      dio.patch(path, data: data);

  Future<Response<dynamic>> delete(String path, {Object? data}) =>
      dio.delete(path, data: data);

  dynamic payload(Response<dynamic> response) {
    final body = response.data;
    if (body is Map && body.containsKey('data')) return body['data'];
    return body;
  }

  List<Map<String, dynamic>> list(Response<dynamic> response) {
    final body = payload(response);
    final items = body is List
        ? body
        : body is Map
        ? (body['items'] ?? body['results'] ?? const [])
        : const [];
    return items
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }
}
