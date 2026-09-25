import 'package:bizos/services/api_service.dart';
import 'package:bizos/theme/app_theme.dart';
import 'package:flutter/material.dart';

class PurchaseOrdersScreen extends StatefulWidget {
  const PurchaseOrdersScreen({super.key});

  @override
  State<PurchaseOrdersScreen> createState() => _PurchaseOrdersScreenState();
}

class _PurchaseOrdersScreenState extends State<PurchaseOrdersScreen> {
  List<Map<String, dynamic>> _orders = const [
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
    {
      'poNumber': 'PO-412',
      'supplier': 'Kisumu Hardware Hub',
      'total': 'KSh 52,100',
      'status': 'Received',
      'eta': 'Delivered',
    },
  ];

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    final items = await ApiService.instance.loadPurchaseOrders();
    if (!mounted) return;
    setState(() {
      _orders = items;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(title: const Text('Purchase orders')),
      body: RefreshIndicator(
        onRefresh: _loadOrders,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: _orders.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final order = _orders[index];
                  final status = order['status'] as String? ?? 'Pending';
                  final isApproved = status.toLowerCase() == 'approved';
                  final isReceived = status.toLowerCase() == 'received';

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
                            color: isReceived
                                ? AppTheme.accent.withAlpha(24)
                                : isApproved
                                ? AppTheme.primary.withAlpha(24)
                                : Colors.orange.withAlpha(22),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            Icons.shopping_bag_rounded,
                            color: isReceived
                                ? AppTheme.primaryDark
                                : isApproved
                                ? AppTheme.primary
                                : Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                order['poNumber'] as String? ?? 'PO',
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                order['supplier'] as String? ?? 'Supplier',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: AppTheme.muted),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                order['eta'] as String? ?? '',
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
                              order['total'] as String? ?? 'KSh 0',
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
                                color: isReceived
                                    ? AppTheme.accent.withAlpha(24)
                                    : isApproved
                                    ? AppTheme.primary.withAlpha(24)
                                    : Colors.orange.withAlpha(18),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                status,
                                style: TextStyle(
                                  color: isReceived
                                      ? AppTheme.primaryDark
                                      : isApproved
                                      ? AppTheme.primary
                                      : Colors.orange.shade700,
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
                },
              ),
      ),
    );
  }
}
