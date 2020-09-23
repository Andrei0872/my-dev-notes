****# Networking Notebook

**iptables** - a _stateful_ firewall

* chain - the state at which a packet is manipulated

* built-in: INPUT, OUTPUT< FORWARD

* forwarded packets - network traffic that is to be forwarded from the firewall to its destination node

* block incoming packets
iptables -P INPUT DROP

* FORWARD policty - control where packets can be routed within a LAN

## Examples

### Change the policy of a chain

```sh
iptables -P FORWARD DROP
```

### SNAT

in -> out

```sh
# -o - interface via which packet is to be sent
# -SNAT - source was changed
iptables -t nat -A POSTROUTING -o eth0 -j SNAT --to-source a.b.c.d:e
```

### DNAT

in <- out

```sh
# -DNAT - destination was changed
# -o interface via whic packet is to be received
iptables -t nat -A PREROUTING -i eht0 -j DNAT --to-destination a.b.c.d:e
```

### Block an IP
 
```sh
# -s - specify source
iptables -t filter -A INPUT -s <IP> -j REJECT
```

### Block SSH access

```sh
# 22 - default SSH port
iptables -t filter -A INPUT -p tcp -m tcp --dport 22 -s <IP> -j DROP
```

### Allow packets from an established connection, deny anything else

Scenario: you blocked `INPUT` from `$IP`, but you can't ask `$IP` for data either, because the packets it sends as a result of the connection are still blocked

```sh
# --cstate - package state
iptables -t filter -A INPUT -m conntrack --cstate ESTABLISHED, RElATED -j ACCEPT
```

### Block IP if request is made via WIFi

```sh
# -o - output interface
# -d - destination
iptables -A OUTPUT -o wlan0 -d <IP> -j DROP
```

### Custom chains

```sh
iptables -N foo-chain

iptables -A foo-chain -s $SOURCE1 -j ACCEPT
iptables -A foo-chain -s $SOURCE2 -j ACCEPT
iptables -A foo-chain -j DROP # drop everything else

iptables -A INPUT -p tcp -m tcp --dport 22 -j foo-chain
```

---

## Differences between filter's table chains

* INPUT - incoming traffic to firewall for the **local server**
* OUTPUT - outgoing traffic from the firewall, going out of the **local server**
* FORWARD - for packets routed through the local server

---

## RESOURCES

* https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&ved=2ahUKEwiageiSncLqAhXBFXcKHUw4AP4QFjABegQICxAE&url=https%3A%2F%2Fcode.tutsplus.com%2Ftutorials%2Fthe-linux-firewall--net-31748&usg=AOvVaw3M9AHKrIPetJqJu8xBHe3p
* https://www.booleanworld.com/depth-guide-iptables-linux-firewall/#The_connection_tracking_module

https://www.youtube.com/playlist?list=PLQnljOFTspQXOkIpdwjsMlVqkIffdqZ2K
https://www.youtube.com/watch?v=ueVnSz_lXEs&list=PL6gx4Cwl9DGBpuvPW0aHa7mKdn_k9SPKO
