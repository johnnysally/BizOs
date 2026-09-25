import 'package:bizos/services/api_service.dart';
import 'package:bizos/theme/app_theme.dart';
import 'package:flutter/material.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  List<Map<String, dynamic>> _products = const [
    {
      'name': 'Aloe Vera Gel',
      'stock': 48,
      'price': 'KSh 240',
      'status': 'In stock',
    },
    {
      'name': 'Battery Pack',
      'stock': 16,
      'price': 'KSh 900',
      'status': 'Low stock',
    },
    {
      'name': 'Coffee Beans',
      'stock': 83,
      'price': 'KSh 520',
      'status': 'In stock',
    },
    {
      'name': 'Office Chair',
      'stock': 9,
      'price': 'KSh 5500',
      'status': 'Low stock',
    },
    {
      'name': 'Power Bank',
      'stock': 26,
      'price': 'KSh 3600',
      'status': 'In stock',
    },
  ];

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    final items = await ApiService.instance.loadProducts();
    if (!mounted) return;
    setState(() {
      _products = items.isNotEmpty ? items : _products;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('Inventory'),
        actions: [
          IconButton(
            onPressed: _loadProducts,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadProducts,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Stock overview',
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_products.length} items tracked',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: AppTheme.muted),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withAlpha(24),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            '${_products.where((p) => ((p['stock'] ?? 0) as num) < 20).length} low stock',
                            style: const TextStyle(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  ..._products.map((product) {
                    final stock = (product['stock'] ?? 0) as num;
                    final isLowStock = stock < 20;
                    final priceValue = product['price'];
                    final priceLabel = priceValue is num
                        ? 'KSh ${priceValue.toStringAsFixed(0)}'
                        : (priceValue as String? ?? 'KSh 0');
                    final status =
                        product['status'] as String? ??
                        (isLowStock ? 'Low stock' : 'In stock');

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: isLowStock
                                  ? Colors.orange.withAlpha(26)
                                  : AppTheme.primary.withAlpha(24),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Icon(
                              Icons.inventory_2_rounded,
                              color: isLowStock
                                  ? Colors.orange
                                  : AppTheme.primary,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  product['name'] as String? ?? 'Product',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '$stock units available',
                                  style: Theme.of(context).textTheme.bodyMedium
                                      ?.copyWith(color: AppTheme.muted),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                priceLabel,
                                style: Theme.of(context).textTheme.titleSmall
                                    ?.copyWith(fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: isLowStock
                                      ? Colors.orange.withAlpha(20)
                                      : AppTheme.accent.withAlpha(24),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  status,
                                  style: TextStyle(
                                    color: isLowStock
                                        ? Colors.orange.shade700
                                        : AppTheme.primaryDark,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
      ),
    );
  }
}
