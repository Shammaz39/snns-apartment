package com.snns.apartment.repository;

import com.snns.apartment.model.Bill;
import com.snns.apartment.model.BillStatus;
import com.snns.apartment.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByRoom(Room room);
    List<Bill> findByRoomIdOrderByCreatedAtDesc(Long roomId);
    List<Bill> findByStatus(BillStatus status);
    List<Bill> findAllByOrderByCreatedAtDesc();
    Optional<Bill> findByRoomIdAndBillingMonth(Long roomId, String billingMonth);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.status = 'PAID'")
    BigDecimal sumTotalPaidRevenue();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.status = 'PENDING' OR b.status = 'PENDING_VERIFICATION'")
    BigDecimal sumTotalPendingRevenue();
}
