# Backend Endpoint Needed

Add this endpoint to your FastAPI backend (`main.py`):

```python
@app.delete("/assignments/day/{week}/{date}")
def delete_day_assignments(week: str, date: str):
    """
    Delete ALL assignments for a specific day.
    Used when converting auto-scheduled day to manual editing.
    
    Args:
        week: ISO week (e.g., "2025-W45")
        date: Date string (e.g., "2025-11-05")
    
    Returns:
        Number of assignments deleted
    """
    try:
        # Get all assignments for this week
        docs = db.collection("assignments").document(week).collection("items").stream()
        
        deleted_count = 0
        for doc in docs:
            data = doc.to_dict()
            # Get shift date to check if it matches
            shift_doc = db.collection("shifts").document(week).collection("items").document(str(data.get("shiftId"))).get()
            if shift_doc.exists:
                shift_data = shift_doc.to_dict()
                if shift_data.get("date") == date:
                    doc.reference.delete()
                    deleted_count += 1
        
        return {
            "week": week,
            "date": date,
            "deleted": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## What This Does

1. Finds all assignments for the given week
2. For each assignment, checks if its shift's date matches the target date
3. Deletes all matching assignments (both auto and manual)
4. Returns count of deleted assignments

## Why It's Needed

When removing a single slot from an auto-generated schedule, we need to:
1. Clear the entire day (using this endpoint)
2. Save back all slots except the removed one as manual assignments
3. This prevents backend deduplication from merging them back together
