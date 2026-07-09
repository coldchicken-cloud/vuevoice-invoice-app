<template>
  <div class="line-items">
    <h3>Item List</h3>
    <table class="item-list">
      <thead>
        <tr class="table-heading flex">
          <th class="item-name">Item Name</th>
          <th class="qty">Qty</th>
          <th class="price">Price</th>
          <th class="total">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr class="table-items flex" v-for="item in items" :key="item.id">
          <td class="item-name"><input type="text" v-model="item.itemName" /></td>
          <td class="qty"><input type="text" v-model.number="item.qty" /></td>
          <td class="price"><input type="text" v-model.number="item.price" /></td>
          <td class="total flex">{{ formatCurrency(lineItemTotal(item), currencyCode) }}</td>
          <td>
            <img @click="$emit('remove-item', item.id)" src="@/assets/icons/icon-delete.svg" alt="Remove item" />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex button" @click="$emit('add-item')">
      <img src="@/assets/icons/icon-plus.svg" alt="" />
      Add New Item
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/currencyFormatter';

// `items` is the same reactive array the parent form owns - entries are
// edited in place here (see .eslintrc.js note on shallowOnly prop
// mutation) while structural changes (add/remove) bubble up as events so
// the parent can recompute the invoice total from a single source.
defineProps({
  items: {
    type: Array,
    required: true,
  },
  currencyCode: {
    type: String,
    required: true,
  },
});
defineEmits(['add-item', 'remove-item']);

function lineItemTotal(item) {
  const total = (Number(item.qty) || 0) * (Number(item.price) || 0);
  item.total = total;
  return total;
}
</script>

<style lang="scss" scoped>
.line-items {
  h3 {
    margin-bottom: 16px;
    font-size: 18px;
    color: var(--color-text-muted);
  }

  .item-list {
    width: 100%;

    .table-heading,
    .table-items {
      gap: 16px;
      font-size: 12px;

      .item-name {
        flex-basis: 50%;
      }

      .qty {
        flex-basis: 10%;
      }

      .price {
        flex-basis: 20%;
      }

      .total {
        flex-basis: 20%;
        align-self: center;
        color: var(--color-text);
      }
    }

    .table-heading {
      margin-bottom: 16px;
      color: var(--color-text-secondary);

      th {
        text-align: left;
      }
    }

    .table-items {
      position: relative;
      margin-bottom: 24px;

      img {
        cursor: pointer;
        position: absolute;
        top: 15px;
        right: 0;
        width: 12px;
        height: 16px;
      }
    }
  }

  .button {
    color: var(--color-text);
    background-color: var(--color-surface-alt);
    align-items: center;
    justify-content: center;
    width: 100%;
    cursor: pointer;

    img {
      margin-right: 4px;
    }
  }
}
</style>