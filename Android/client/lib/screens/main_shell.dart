import 'package:bizos/screens/home/customers_screen.dart';
import 'package:bizos/screens/home/more_screen.dart';
import 'package:bizos/screens/home/overview_screen.dart';
import 'package:bizos/screens/home/products_screen.dart';
import 'package:bizos/screens/home/sales_screen.dart';
import 'package:bizos/theme/app_theme.dart';
import 'package:flutter/material.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    OverviewScreen(),
    ProductsScreen(),
    SalesScreen(),
    CustomersScreen(),
    MoreScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        backgroundColor: Colors.white,
        indicatorColor: AppTheme.primary.withAlpha(24),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_rounded), label: 'Home'),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_rounded),
            label: 'Inventory',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_rounded),
            label: 'Sales',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_alt_rounded),
            label: 'Customers',
          ),
          NavigationDestination(icon: Icon(Icons.apps_rounded), label: 'More'),
        ],
      ),
    );
  }
}
