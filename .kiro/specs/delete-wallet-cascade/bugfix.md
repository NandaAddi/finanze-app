# Bugfix Requirements Document

## Introduction

Fungsi `deleteWallet` di `app/actions/finance.ts` hanya menghapus record wallet dari tabel `wallets` tanpa menghapus transaksi yang terhubung (`wallet_id = id`) di tabel `transactions`. Jika tidak ada constraint `ON DELETE CASCADE` di level database, transaksi-transaksi tersebut menjadi *orphan* — tetap ada di database namun tidak memiliki wallet yang valid. Kondisi ini menyebabkan inkonsistensi data yang dapat mempengaruhi kalkulasi saldo, laporan analitik, dan integritas referensial secara keseluruhan.

## Bug Analysis

### Current Behavior (Defect)

Kondisi yang memicu bug: wallet dihapus melalui fungsi `deleteWallet(id)`.

1.1 WHEN wallet dihapus melalui `deleteWallet(id)` THEN the system hanya menghapus record dari tabel `wallets` tanpa menghapus transaksi terkait di tabel `transactions`

1.2 WHEN wallet dihapus dan tidak ada `ON DELETE CASCADE` di database THEN the system meninggalkan transaksi dengan `wallet_id` yang merujuk ke wallet yang sudah tidak ada (orphan records)

1.3 WHEN transaksi orphan ada di database THEN the system dapat menampilkan data yang tidak konsisten pada halaman analitik, laporan, dan pencarian transaksi

1.4 WHEN `deleteWallet` dipanggil dari `app/dashboard/wallets/page.tsx` atau `app/dashboard/wallets/[id]/page.tsx` THEN the system tidak memberikan feedback error meskipun transaksi orphan terbentuk

### Expected Behavior (Correct)

2.1 WHEN wallet dihapus melalui `deleteWallet(id)` THEN the system SHALL menghapus semua transaksi yang memiliki `wallet_id = id` sebelum menghapus record wallet tersebut

2.2 WHEN penghapusan transaksi terkait berhasil THEN the system SHALL melanjutkan penghapusan record wallet dari tabel `wallets`

2.3 WHEN wallet dihapus beserta seluruh transaksinya THEN the system SHALL memastikan tidak ada transaksi orphan yang tersisa di tabel `transactions`

2.4 WHEN proses penghapusan (transaksi + wallet) gagal di salah satu langkah THEN the system SHALL mengembalikan `{ success: false, error: message }` tanpa meninggalkan data dalam kondisi setengah terhapus

### Unchanged Behavior (Regression Prevention)

3.1 WHEN wallet yang valid dihapus oleh user yang berhak THEN the system SHALL CONTINUE TO memvalidasi kepemilikan wallet menggunakan `user_id` dari Clerk auth sebelum melakukan penghapusan

3.2 WHEN penghapusan wallet berhasil THEN the system SHALL CONTINUE TO memanggil `revalidatePath('/dashboard')` untuk memperbarui cache halaman

3.3 WHEN penghapusan wallet berhasil THEN the system SHALL CONTINUE TO mengembalikan `{ success: true }`

3.4 WHEN user tidak terautentikasi mencoba menghapus wallet THEN the system SHALL CONTINUE TO melempar error `Unauthorized`

3.5 WHEN transaksi individual dihapus melalui `deleteTransactionAction(id)` THEN the system SHALL CONTINUE TO melakukan adjustment saldo wallet secara normal (fungsi ini tidak terpengaruh oleh fix)

3.6 WHEN wallet lain milik user yang sama diakses setelah penghapusan THEN the system SHALL CONTINUE TO menampilkan data wallet dan transaksinya dengan benar

---

## Bug Condition (Pseudocode)

**Bug Condition Function** — mengidentifikasi input yang memicu bug:

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type WalletDeleteInput { id: string, userId: string }
  OUTPUT: boolean

  // Bug terpicu ketika wallet yang memiliki transaksi terkait dihapus
  transactionCount ← COUNT(transactions WHERE wallet_id = X.id AND created_by = X.userId)
  RETURN transactionCount > 0
END FUNCTION
```

**Property: Fix Checking** — perilaku yang benar untuk input buggy:

```pascal
// Property: Fix Checking - Cascade Delete Transactions
FOR ALL X WHERE isBugCondition(X) DO
  result ← deleteWallet'(X.id)
  orphanCount ← COUNT(transactions WHERE wallet_id = X.id)
  ASSERT result.success = true
  ASSERT orphanCount = 0
END FOR
```

**Property: Preservation Checking** — perilaku yang harus tetap sama untuk input non-buggy:

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  // Wallet tanpa transaksi — perilaku deleteWallet harus identik
  ASSERT deleteWallet(X) = deleteWallet'(X)
END FOR
```

> **Keterangan:**
> - **F** (`deleteWallet`): Fungsi asli yang hanya menghapus wallet
> - **F'** (`deleteWallet'`): Fungsi yang sudah diperbaiki — menghapus transaksi terlebih dahulu, lalu wallet
