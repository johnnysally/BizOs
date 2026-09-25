import 'package:bizos/screens/home/invoices_screen.dart';
import 'package:bizos/screens/home/profile_screen.dart';
import 'package:bizos/screens/home/purchase_orders_screen.dart';
import 'package:bizos/screens/home/suppliers_screen.dart';
import 'package:bizos/theme/app_theme.dart';
import 'package:flutter/material.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final modules = [
      _ModuleItem(
        title: 'Suppliers',
        subtitle: 'Vendor and procurement records',
        icon: Icons.local_shipping_rounded,
        color: AppTheme.primary,
        page: const SuppliersScreen(),
      ),
      _ModuleItem(
        title: 'Invoices',
        subtitle: 'Customer billing and due amounts',
        icon: Icons.receipt_long_rounded,
        color: Colors.orange,
        page: const InvoicesScreen(),
      ),
      _ModuleItem(
        title: 'Purchase Orders',
        subtitle: 'Inventory ordering and receiving',
        icon: Icons.shopping_bag_rounded,
        color: Colors.purple,
        page: const PurchaseOrdersScreen(),
      ),
      _ModuleItem(
        title: 'Profile',
        subtitle: 'Business details and account settings',
        icon: Icons.person_rounded,
        color: AppTheme.primaryDark,
        page: const ProfileScreen(),
      ),
    ];

    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(title: const Text('BizOs Modules')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Business operations',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 20),
          ...modules.map((module) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.border),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                leading: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: module.color.withAlpha(24),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(module.icon, color: module.color),
                ),
                title: Text(
                  module.title,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                subtitle: Text(module.subtitle),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute<void>(builder: (_) => module.page),
                  );
                },
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _ModuleItem {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final Widget page;

  const _ModuleItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.page,
  });
}
