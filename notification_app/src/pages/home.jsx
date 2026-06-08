import { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, MenuItem, Pagination, Select, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const TOKEN = import.meta.env.VITE_TOKEN;
const API_URL = "/api/evaluation-service/notifications";

const WEIGHT = { Placement: 3, Result: 2, Event: 1 };

const getScore = (notification) => (WEIGHT[notification.Type] || 0) * 1e13 + new Date(notification.Timestamp).getTime();

function Home() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topN, setTopN] = useState(10);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [viewed, setViewed] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        let url = `${API_URL}?limit=${topN}&page=${page}`;
        if (type) url += `&notification_type=${type}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        const data = await response.json();

        setNotifications(data.notifications || []);
      } catch {
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, type, topN]);

  const sortedNotifications = [...notifications].sort((a, b) => getScore(b) - getScore(a));

  const handleViewed = (id) => {
    setViewed((current) => (current.includes(id) ? current : [...current, id]));
  };

  const openNotification = (notification) => {
    handleViewed(notification.ID);
    setSelected(notification);
    setOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" p={4}>{error}</Typography>;
  }

  return (
    <Box maxWidth={800} mx="auto" p={3}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Top Priority Notifications
      </Typography>

      <Box>
        <Select size="small" value={topN} onChange={(e) => setTopN(Number(e.target.value))}>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </Select>
        
        <Select size="small" value={type} displayEmpty onChange={(e) => setType(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Event">Event</MenuItem>
          <MenuItem value="Result">Result</MenuItem>
          <MenuItem value="Placement">Placement</MenuItem>
        </Select>
      </Box>

      <Box>
        {sortedNotifications.map((notification, index) => {
          const isViewed = viewed.includes(notification.ID);

          return (
            <Box
              key={notification.ID}
              onClick={() => openNotification(notification)}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 2,
                mb: 1,
                opacity: isViewed ? 0.6 : 1,
                cursor: "pointer",
                backgroundColor: "background.paper",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700}>
                  #{index + 1} {notification.Type}
                </Typography>
                <Chip size="small" label={isViewed ? "Viewed" : "New"} color={isViewed ? "default" : "primary"} />
              </Box>

              <Typography mt={1} sx={{ wordBreak: "break-word" }}>{notification.Message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(notification.Timestamp).toLocaleString()}
              </Typography>
            </Box>
          );
        })}

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Notification Details</DialogTitle>
          <DialogContent dividers>
            {selected && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  {selected.Type}
                </Typography>
                <Typography sx={{ mb: 2 }}>{selected.Message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(selected.Timestamp).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box mt={4} display="flex" justifyContent="center">
        <Pagination count={5} page={page} onChange={(_, value) => setPage(value)} color="primary" />
      </Box>
    </Box>
  );
}

export default Home;
