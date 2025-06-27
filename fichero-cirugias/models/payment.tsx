class Payment {
  constructor(
    public id: number,
    public fichaId: number, // Foreign key to Ficha
    public doctor: string, // Doctor who performed the surgery
    public paymentSource: "clinic" | "patient",
    public paymentStatus: "pending" | "paid",
    public amount?: number,
    public paymentDate?: Date,
    public notes?: string
  ) {}
}

export default Payment;
