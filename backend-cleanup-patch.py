# Backend Patch: Complete Cleanup Endpoint
# This code should replace the incomplete cleanup_duplicate_assignments function in main.py

@app.post("/assignments/cleanup/{week}")
def cleanup_duplicate_assignments(week: str):
    """
    Remove duplicate manual assignments for the same (shift, employee, role).
    Groups by (shiftId, employeeId, role) and keeps the widest time range.
    """
    try:
        db = get_firestore()
        week_ref = db.collection("weeks").document(week)
        docs = list(week_ref.collection("assignments").stream())
        
        # Group by (shift, employee, role)
        groups = {}
        for d in docs:
            data = d.to_dict()
            if not data.get("isManual"):
                continue  # Skip auto-generated assignments
            
            # Group by (shiftId, employeeId, role)
            key = (data.get("shiftId"), data.get("employeeId"), data.get("role", "").upper())
            if key not in groups:
                groups[key] = []
            groups[key].append((d.id, data))
        
        deleted_count = 0
        kept_count = 0
        
        # Helper: Convert time string to minutes since midnight
        def time_to_minutes(time_str):
            if not time_str:
                return 0
            import re
            time_str = str(time_str).strip().lower()
            match = re.match(r'^(\d{1,2}):(\d{2})\s*(am|pm)$', time_str)
            if not match:
                return 0
            hours = int(match.group(1))
            minutes = int(match.group(2))
            period = match.group(3)
            if period == 'pm' and hours != 12:
                hours += 12
            elif period == 'am' and hours == 12:
                hours = 0
            return hours * 60 + minutes
        
        # For each group, keep the widest time range
        for (shift_id, emp_id, role), docs_list in groups.items():
            if len(docs_list) <= 1:
                kept_count += len(docs_list)
                continue
            
            # Find the doc with widest time range (earliest start, latest end)
            widest_doc = None
            widest_span = 0
            earliest_start = float('inf')
            latest_end = 0
            
            for doc_id, data in docs_list:
                start = time_to_minutes(data.get("startTime", ""))
                end = time_to_minutes(data.get("endTime", ""))
                span = end - start if end > start else 0
                
                # Prefer widest span, but also track earliest/latest
                if span > widest_span:
                    widest_span = span
                    widest_doc = doc_id
                    earliest_start = start
                    latest_end = end
                elif span == widest_span:
                    # If same span, prefer the one with earlier start
                    if start < earliest_start:
                        widest_doc = doc_id
                        earliest_start = start
                        latest_end = end
            
            # Fallback to first if no valid times found
            if not widest_doc:
                widest_doc = docs_list[0][0]
            
            kept_count += 1
            
            # Delete all others
            for doc_id, _ in docs_list:
                if doc_id != widest_doc:
                    week_ref.collection("assignments").document(doc_id).delete()
                    deleted_count += 1
                    print(f"[CLEANUP] Deleted duplicate: {doc_id} (shift={shift_id}, emp={emp_id}, role={role})")
        
        message = f"Cleaned up {deleted_count} duplicate assignments, kept {kept_count}"
        print(f"[CLEANUP] {message}")
        
        return {
            "week": week,
            "deleted": deleted_count,
            "kept": kept_count,
            "message": message
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error cleaning up assignments: {e}")
