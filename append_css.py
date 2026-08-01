with open('C:/Users/User/VS_Projects/JSS_Internship_Web/style.css', 'a', encoding='utf-8') as f:
    f.write('''
/* Added responsive grid classes */
.pd-layout-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
}

.pd-checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
}

.pd-checkout-inner-grid,
.pd-checkout-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.ph-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 960px) {
  .pd-layout-grid,
  .pd-checkout-grid,
  .pd-checkout-inner-grid,
  .pd-checkout-card-grid,
  .ph-stats,
  .outcomes-grid {
    grid-template-columns: 1fr !important;
  }
}
''')
print("Appended successfully")
