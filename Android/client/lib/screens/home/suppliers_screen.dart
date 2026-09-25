import 'package:bizos/services/api_service.dart';
import 'package:bizos/theme/app_theme.dart';
import 'package:flutter/material.dart';

class SuppliersScreen extends StatefulWidget {
  const SuppliersScreen({super.key});

  @override
  State<SuppliersScreen> createState() => _SuppliersScreenState();
}

class _SuppliersScreenState extends State<SuppliersScreen> {
  List<Map<String, dynamic>> _suppliers = const [
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
    {
      'name': 'Kisumu Hardware Hub',
      'contact': 'Njeri Achieng',
      'phone': '+254 734 456 222',
      'status': 'Active',
      'orders': '19 orders',
      'lastOrder': '3 days ago',
    },
  ];

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSuppliers();
  }

  Future<void> _loadSuppliers() async {
    final items = await ApiService.instance.loadSuppliers();
    if (!mounted) return;
    setState(() {
      _suppliers = items;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(title: const Text('Suppliers')),
      body: RefreshIndicator(
        onRefresh: _loadSuppliers,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: _suppliers.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final supplier = _suppliers[index];
                  final status = supplier['status'] as String? ?? 'Active';
                  final active = status.toLowerCase() == 'active';

                  return Container(
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
                            color: active
                                ? AppTheme.primary.withAlpha(24)
                                : Colors.orange.withAlpha(24),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            Icons.local_shipping_rounded,
                            color: active ? AppTheme.primary : Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                supplier['name'] as String? ?? 'Supplier',
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                supplier['contact'] as String? ?? '',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: AppTheme.muted),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                supplier['phone'] as String? ?? '',
                                style: Theme.of(context).textTheme.bodySmall
                                    ?.copyWith(color: AppTheme.muted),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              supplier['orders'] as String? ?? '0 orders',
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
                                color: active
                                    ? AppTheme.accent.withAlpha(24)
                                    : Colors.orange.withAlpha(18),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                status,
                                style: TextStyle(
                                  color: active
                                      ? AppTheme.primaryDark
                                      : Colors.orange.shade700,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              supplier['lastOrder'] as String? ?? '',
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(color: AppTheme.muted),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
