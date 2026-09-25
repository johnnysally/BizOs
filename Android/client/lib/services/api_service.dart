import 'package:bizos/constants.dart';
import 'package:bizos/services/storage_service.dart';
import 'package:dio/dio.dart';

class AuthSession {
  final String accessToken;
  final String refreshToken;
  final Map<String, dynamic> user;

  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });
}

class ApiService {
  ApiService._internal();

  static final ApiService instance = ApiService._internal();

  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: kApiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  ApiService() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await StorageService.getAccessToken();
          if (token != null &&
              token.isNotEmpty &&
              !options.path.contains('/public/')) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final statusCode = error.response?.statusCode;
          final isAuthRequest = error.requestOptions.path.contains(
            '/public/auth',
          );
          if (statusCode == 401 && !isAuthRequest) {
            final refreshToken = await StorageService.getRefreshToken();
            if (refreshToken != null && refreshToken.isNotEmpty) {
              try {
                final response = await _dio.post(
                  '/public/auth/refresh',
                  data: {'refreshToken': refreshToken},
                );
                final payload = response.data is Map
                    ? response.data['data'] ?? response.data
                    : <String, dynamic>{};
                final accessToken = payload['accessToken'] as String? ?? '';
                final nextRefreshToken =
                    payload['refreshToken'] as String? ?? refreshToken;
                if (accessToken.isNotEmpty) {
                  await StorageService.saveSession(
                    accessToken: accessToken,
                    refreshToken: nextRefreshToken,
                    user: await StorageService.getUser(),
                  );
                  error.requestOptions.headers['Authorization'] =
                      'Bearer $accessToken';
                  final retry = await _dio.fetch(error.requestOptions);
                  return handler.resolve(retry);
                }
              } catch (_) {
                await StorageService.clearSession();
              }
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(
      '/public/auth/login',
      data: {'email': email, 'password': password},
    );

    final payload = response.data is Map
        ? response.data['data'] ?? response.data
        : <String, dynamic>{};
    final accessToken = payload['accessToken'] as String? ?? '';
    final refreshToken = payload['refreshToken'] as String? ?? '';
    final user = Map<String, dynamic>.from(payload['user'] ?? {});

    if (accessToken.isEmpty || refreshToken.isEmpty) {
      throw const FormatException('Invalid login response from BizOS backend.');
    }

    return AuthSession(
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: user,
    );
  }

  Future<Map<String, dynamic>> loadProfile() async {
    try {
      final response = await _dio.get('/client/auth/me');
      final payload = response.data is Map
          ? response.data['data'] ?? response.data
          : <String, dynamic>{};
      return Map<String, dynamic>.from(payload);
    } catch (_) {
      return {'name': 'BizOS User', 'email': 'user@bizos.local'};
    }
  }

  List<Map<String, dynamic>> _normalizeList(dynamic payload) {
    if (payload is List) {
      return payload
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList();
    }

    if (payload is Map) {
      final data = payload['data'] ?? payload['items'] ?? payload['results'];
      if (data is List) {
        return data
            .whereType<Map>()
            .map((item) => Map<String, dynamic>.from(item))
            .toList();
      }
    }

    return const <Map<String, dynamic>>[];
  }

  Future<Map<String, dynamic>> loadDashboardSummary() async {
    try {
      final response = await _dio.get('/client/dashboard/summary');
      final payload = response.data is Map
          ? response.data['data'] ?? response.data
          : <String, dynamic>{};
      return Map<String, dynamic>.from(payload);
    } catch (_) {
      return {
        'grossSales': 32540,
        'orders': 184,
        'customers': 86,
        'stockValue': 14250,
        'suppliers': 18,
        'invoicesDue': 24,
        'purchaseOrders': 11,
      };
    }
  }

  Future<List<Map<String, dynamic>>> loadProducts() async {
    try {
      final response = await _dio.get('/client/products');
      return _normalizeList(response.data);
    } catch (_) {
      return const [
        {
          'name': 'Aloe Vera Gel',
          'stock': 48,
          'price': 240,
          'status': 'In stock',
        },
        {
          'name': 'Battery Pack',
          'stock': 16,
          'price': 900,
          'status': 'Low stock',
        },
        {
          'name': 'Coffee Beans',
          'stock': 83,
          'price': 520,
          'status': 'In stock',
        },
      ];
    }
  }

  Future<List<Map<String, dynamic>>> loadSales() async {
    try {
      final response = await _dio.get('/client/sales');
      return _normalizeList(response.data);
    } catch (_) {
      return const [
        {
          'customer': 'Amina Njeri',
          'amount': 'KSh 8,500',
          'status': 'Paid',
          'time': '09:20 AM',
        },
        {
          'customer': 'Kibichii Stores',
          'amount': 'KSh 14,200',
          'status': 'Pending',
          'time': '11:05 AM',
        },
      ];
    }
  }

  Future<List<Map<String, dynamic>>> loadCustomers() async {
    try {
      final response = await _dio.get('/client/customers');
      return _normalizeList(response.data);
    } catch (_) {
      return const [
        {
          'name': 'Amina Njeri',
          'segment': 'Retail',
          'spent': 'KSh 65,400',
          'status': 'Active',
        },
        {
          'name': 'Kibichii Stores',
          'segment': 'Wholesale',
          'spent': 'KSh 112,800',
          'status': 'Priority',
        },
      ];
    }
  }

  Future<List<Map<String, dynamic>>> loadSuppliers() async {
    try {
      final response = await _dio.get('/client/suppliers');
      return _normalizeList(response.data);
    } catch (_) {
      return const [
        {
          'name': 'Nairobi Fresh Foods',
          'contact': 'Grace Wanjiku',
          'phone': '+254 712 345 678',
          'status': 'Active',
          'orders': '14 orders',
          'lastOrder': '2 days ago',
        },
        {
          'name': 'Cedar Office Supply',
          'contact': 'Daniel Kibet',
          'phone': '+254 722 220 999',
          'status': 'Follow-up',
          'orders': '8 orders',
          'lastOrder': '1 week ago',
        },
      ];
    }
  }

  Future<List<Map<String, dynamic>>> loadInvoices() async {
    try {
      final response = await _dio.get('/client/invoices');
      return _normalizeList(response.data);
    } catch (_) {
      return const [
        {
          'invoiceNumber': 'INV-1048',
          'customer': 'Kibichii Stores',
          'amountDue': 'KSh 24,500',
          'status': 'Pending',
          'dueDate': 'Due today',
        },
        {
          'invoiceNumber': 'INV-1032',
          'customer': 'Amina Njeri',
          'amountDue': 'KSh 8,400',
          'status': 'Paid',
          'dueDate': 'Paid',
        },
      ];
    }
  }

  Future<List<Map<String, dynamic>>> loadPurchaseOrders() async {
    try {
      final response = await _dio.get('/client/purchase-orders');
      return _normalizeList(response.data);
    } catch (_) {
      return const [
        {
          'poNumber': 'PO-410',
          'supplier': 'Nairobi Fresh Foods',
          'total': 'KSh 35,800',
          'status': 'Approved',
          'eta': 'ETA 2 days',
        },
        {
          'poNumber': 'PO-411',
          'supplier': 'Cedar Office Supply',
          'total': 'KSh 18,900',
          'status': 'Pending',
          'eta': 'Awaiting approval',
        },
      ];
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/client/auth/logout');
    } catch (_) {
      // Keep silent: the mobile app should still clear local auth regardless.
    }
    await StorageService.clearSession();
  }
}
