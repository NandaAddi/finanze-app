# Bugfix Requirements Document

## Introduction

Fungsi `seedDefaultCategories` di `app/actions/finance.ts` mengembalikan `{ success: true }` (sebuah object) alih-alih array kategori yang baru dibuat. Konsumer satu-satunya fungsi ini — `components/add-transaction-dialog.tsx` — memperlakukan return value sebagai array, sehingga dropdown kategori selalu kosong bagi user baru yang belum memiliki kategori apapun. Bug ini berdampak langsung pada kemampuan user baru untuk membuat transaksi pertama mereka.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `seedDefaultCategories` dipanggil untuk user baru yang belum memiliki kategori THEN fungsi berhasil menyimpan kategori ke database namun mengembalikan `{ success: true }` bukan array kategori yang baru dibuat

1.2 WHEN `add-transaction-dialog.tsx` menerima return value dari `seedDefaultCategories` THEN `setCategories(seeded || [])` mengisi state `categories` dengan object `{ success: true }` bukan array, sehingga dropdown kategori tidak menampilkan item apapun

1.3 WHEN `add-transaction-dialog.tsx` mengevaluasi `seeded.length` dari return value `seedDefaultCategories` THEN ekspresi bernilai `undefined` karena object `{ success: true }` tidak memiliki properti `length`, sehingga `categoryId` default tidak pernah di-set

### Expected Behavior (Correct)

2.1 WHEN `seedDefaultCategories` dipanggil dan insert ke database berhasil THEN fungsi SHALL mengembalikan array kategori yang baru dibuat (hasil dari operasi insert), bukan `{ success: true }`

2.2 WHEN `add-transaction-dialog.tsx` menerima return value dari `seedDefaultCategories` THEN `setCategories(seeded || [])` SHALL mengisi state `categories` dengan array kategori yang valid sehingga dropdown menampilkan pilihan kategori

2.3 WHEN `add-transaction-dialog.tsx` mengevaluasi `seeded.length` dari return value `seedDefaultCategories` THEN ekspresi SHALL bernilai `3` (jumlah kategori default) sehingga `setCategoryId(seeded[0].id)` berhasil men-set kategori default pertama

### Unchanged Behavior (Regression Prevention)

3.1 WHEN user sudah memiliki kategori yang tersimpan di database THEN sistem SHALL CONTINUE TO memuat dan menampilkan kategori yang ada tanpa memanggil `seedDefaultCategories`

3.2 WHEN `seedDefaultCategories` dipanggil THEN sistem SHALL CONTINUE TO menyimpan tiga kategori default (Food, Transport, Others) ke tabel `categories` dengan `wallet_id` dan `created_by` yang benar

3.3 WHEN `seedDefaultCategories` dipanggil THEN sistem SHALL CONTINUE TO memvalidasi autentikasi user via Clerk sebelum melakukan operasi database

3.4 WHEN user membuka dialog "Add Transaction" dan kategori berhasil di-seed THEN sistem SHALL CONTINUE TO menampilkan kategori pertama sebagai pilihan default di dropdown

---

## Bug Condition (Pseudocode)

**Bug Condition Function** — mengidentifikasi input yang memicu bug:

```pascal
FUNCTION isBugCondition(context)
  INPUT: context berisi { categoryData: array, walletData: array }
  OUTPUT: boolean

  // Bug terpicu saat user baru membuka dialog Add Transaction
  // dan belum memiliki kategori apapun
  RETURN (categoryData = NULL OR categoryData.length = 0)
         AND (walletData != NULL AND walletData.length > 0)
END FUNCTION
```

**Property: Fix Checking** — perilaku yang benar untuk input buggy:

```pascal
// Property: Fix Checking — seedDefaultCategories harus return array
FOR ALL context WHERE isBugCondition(context) DO
  seeded ← seedDefaultCategories'(context.walletData[0].id)
  ASSERT Array.isArray(seeded) = true
  ASSERT seeded.length > 0
  ASSERT seeded[0].id != NULL
END FOR
```

**Property: Preservation Checking** — perilaku yang tidak boleh berubah:

```pascal
// Property: Preservation Checking
FOR ALL context WHERE NOT isBugCondition(context) DO
  // Kategori sudah ada — seedDefaultCategories tidak dipanggil
  ASSERT categories = getCategories(userId)
  ASSERT categories.length > 0
END FOR
```

> **F** = `seedDefaultCategories` sebelum fix (return `{ success: true }`)
> **F'** = `seedDefaultCategories` setelah fix (return array kategori)
