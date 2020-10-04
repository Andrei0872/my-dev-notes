****# Networking Notebook

**iptables** - a _stateful_ firewall

* chain - the state at which a packet is manipulated

* built-in: INPUT, OUTPUT< FORWARD

* forwarded packets - network traffic that is to be forwarded from the firewall to its destination node

* block incoming packets
iptables -P INPUT DROP

* FORWARD policty - control where packets can be routed within a LAN

* nexthop - an IP address entry a routing table which specifies the closest router in its routing path

* default gateway - node that serves as the **forwarding** host

* virtual network interface - a **virtualized representation** of a **computer network interface** that may or my not correspond directly to a **network interface controller**

* network interface controller - what connects a **computer** to a **computer network**(Ethernet, Wi-Fi)

* network interface - what connects a computer and a private/public network(e.g enp5s0)

* longest path prefix 
  * when looking for a routing table entry for a given **destination address**, choose the one with the **longest prefix** that matches **the destination prefix**; the route uses this algorithm to determine the egress interface and the address of the device to which to send the packet
  * prefix length = the number of bits set in the subnet mask
  * the way it works is that when a destination IP address arrives, it is checked against the information stored in the routing table; for each row(until it finds the correct match), it will perform and `AND` bitwise operation between the destination IP address and the netmask at the current row; it will then check if the result corresponds to the IP address at the current row
    ```
    Row 1: Network 10.0.0.0 / 255.255.255.0
    Row 2: Network 10.0.0.0 / 255.255.0.0
    Row 3: Network 10.0.0.0 / 255.0.0.0
    ```

    If a packet destined to `10.10.10.10` arrives, the 3rd row will be selected.

  * [resource 1](https://www.juniper.net/documentation/en_US/junos/topics/reference/configuration-statement/longest-match-next-hop-edit-static-routing-options.html); [resource 2](https://community.cisco.com/t5/switching/please-explain-how-the-longest-prefix-matching-works/td-p/2891235); [resource 3](https://unix.stackexchange.com/a/101523); [resource 4](https://www.thegeekstuff.com/2012/04/route-examples/)

* ARP - translates IP address into machine's physical address

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
